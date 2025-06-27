#include <Wire.h>
#include <SPI.h>
#include <MFRC522v2.h>
#include <MFRC522DriverSPI.h>
#include <MFRC522DriverPinSimple.h>
#include <MFRC522Debug.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h> // Usar la biblioteca ESP32Servo

// Configuración de la pantalla OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Configuración del pin para el RFID
MFRC522DriverPinSimple ss_pin(5);
MFRC522DriverSPI driver{ss_pin}; // Crear driver SPI
MFRC522 mfrc522{driver};          // Crear instancia MFRC522

// Configuración WiFi
const char* ssid = "Admin"; // Reemplaza con el nombre de tu red
const char* password = "123456789"; // Reemplaza con la contraseña de tu red

// Configuración del servidor backend
const char* serverURL = "http://192.168.16.3:5000/rfid"; // URL base del servidor backend

// Configuración de los LEDs y buzzer
#define LED_ROJO 15 // Pin para el LED rojo (acceso denegado)
#define LED_VERDE 2 // Pin para el LED verde (acceso concedido)
#define SERVO_PIN 13 // Pin para el servo motor
#define BUZZER_PIN 17 // Pin para el buzzer (elige uno disponible en tu ESP32)

// Configuración de los pulsadores
#define BTN_ABRIR 4   // Pulsador para abrir la puerta desde dentro
#define BTN_FIN   16  // Pulsador para terminar la clase

Servo servo; // Crear instancia del servo

bool claseIniciada = false; // Variable para indicar si la clase ha sido iniciada
String claseId = ""; // ID de la clase iniciada
String materia = "";
String profesor = "";
int cantidadEstudiantes = 0;

unsigned long lastDisplaySwitch = 0;
bool mostrarResumen = true;
int flechaFrame = 0;
unsigned long lastFlechaUpdate = 0;

void setup() {
  Serial.begin(115200);  // Inicializar comunicación serial
  while (!Serial);       // Esperar a que se abra el puerto serial

  // Configurar pines de los LEDs y buzzer
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(LED_ROJO, LOW);
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Configurar pines de los botones
  pinMode(BTN_ABRIR, INPUT_PULLUP);
  pinMode(BTN_FIN, INPUT_PULLUP);

  // Inicializar OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("ERROR: Fallo en la asignación de SSD1306"));
    while (true); // Detener
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Iniciando lector RFID...");
  display.display();

  mfrc522.PCD_Init();    // Inicializar la placa MFRC522
  MFRC522Debug::PCD_DumpVersionToSerial(mfrc522, Serial); // Mostrar detalles del lector
  Serial.println(F("Acerque la tarjeta para ver el UID..."));

  // Conectar a WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado a la red WiFi");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());

  // Inicializar el servo
  servo.attach(SERVO_PIN); // Conectar el servo al pin definido
  servo.write(0); // Asegurarse de que el servo esté en la posición cerrada (0 grados)

  // Prueba de conexión a la ruta /home
  testConnection();
}

void testConnection() {
  HTTPClient http;
  http.begin("http://192.168.16.3:5000/home"); // URL de la ruta /home
  int httpResponseCode = http.GET();

  Serial.print("Código de respuesta HTTP (prueba /home): ");
  Serial.println(httpResponseCode);

  if (httpResponseCode > 0) {
    if (httpResponseCode == HTTP_CODE_OK) {
      String payload = http.getString();
      Serial.println("Payload recibido (prueba /home):");
      Serial.println(payload);
    }
  } else {
    Serial.print("Error al enviar la solicitud (prueba /home): ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  http.end();
}

void loop() {
  // Pulsador para abrir puerta desde dentro
  if (digitalRead(BTN_ABRIR) == LOW) {
    moverServo();
    delay(1000); // Antirebote y evitar múltiples aperturas
  }

  // Pulsador para terminar la clase
  if (digitalRead(BTN_FIN) == LOW && claseIniciada) {
    terminarClase();
    delay(1000); // Antirebote
  }

  // Si no hay nueva tarjeta presente
  if (!mfrc522.PICC_IsNewCardPresent()) {
    if (!claseIniciada) {
      mostrarMensajeInicialAnimado();
    } else {
      // Alternar entre resumen y mensaje de escaneo cada 5 segundos
      if (millis() - lastDisplaySwitch > 5000) {
        mostrarResumen = !mostrarResumen;
        lastDisplaySwitch = millis();
      }
      if (mostrarResumen) {
        mostrarSummary();
      } else {
        mostrarMensajeInicialAnimado();
      }
    }
    return;
  }

  // Seleccionar una de las tarjetas
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Obtener UID
  String uidStr = getUID();

  // Enviar UID al servidor backend
  Serial.print("Enviando UID: ");
  Serial.println(uidStr);
  enviarRFID(uidStr);

  // Detener la comunicación con la tarjeta
  mfrc522.PICC_HaltA();
  delay(500); // Esperar un poco antes de la próxima lectura
}

String getUID() {
  String uidStr = "";
  if (mfrc522.uid.size > 0) {
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      uidStr += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
      uidStr += String(mfrc522.uid.uidByte[i], HEX);
    }
    uidStr.toUpperCase();
  }
  return uidStr;
}

void enviarRFID(String uid) {
  HTTPClient http;
  String endpoint;
  
  if (claseIniciada) {
    // Si la clase ya está iniciada, intentamos registrar asistencia de estudiante
    endpoint = String(serverURL) + "/registrar-asistencia";
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");
    String httpRequestData = "{\"rfid\":\"" + uid + "\",\"claseId\":" + claseId + "}";
    Serial.println("Solicitud de asistencia: " + httpRequestData);
    int httpResponseCode = http.POST(httpRequestData);
    procesarRespuesta(http, httpResponseCode);
  } else {
    // Si no hay clase iniciada, verificamos si es un profesor para iniciar clase
    endpoint = String(serverURL) + "/profesor/" + uid;
    http.begin(endpoint);
    int httpResponseCode = http.GET();
    Serial.println("Verificando profesor: " + endpoint);
    if (httpResponseCode == HTTP_CODE_OK) {
      String payload = http.getString();
      Serial.println("Respuesta de profesor: " + payload);
      // Si es un profesor, intentamos iniciar clase
      if (payload.indexOf("profesor") != -1) {
        http.end();
        iniciarClase(uid);
        return;
      }
    }
    http.end();
    
    // Si no es un profesor o no se puede iniciar clase, verificamos si es un estudiante
    endpoint = String(serverURL) + "/estudiante/" + uid;
    http.begin(endpoint);
    httpResponseCode = http.GET();
    Serial.println("Verificando estudiante: " + endpoint);
    procesarRespuesta(http, httpResponseCode);
  }
  http.end();
}

void iniciarClase(String uid) {
  HTTPClient http;
  String endpoint = String(serverURL) + "/iniciar-clase";
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  
  // Obtener día y hora actual (simulado, deberías usar un RTC o NTP)
  String dia = "Lunes"; // Reemplaza con el día actual
  String hora = "15:00:00"; // Reemplaza con la hora actual
  
  String httpRequestData = "{\"rfid\":\"" + uid + "\",\"dia\":\"" + dia + "\",\"hora\":\"" + hora + "\"}";
  Serial.println("Iniciando clase: " + httpRequestData);
  int httpResponseCode = http.POST(httpRequestData);
  procesarRespuesta(http, httpResponseCode);
  http.end();
}

void terminarClase() {
  if (claseId == "") return; // No hay clase iniciada

  HTTPClient http;
  String endpoint = String(serverURL) + "/terminar-clase";
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");

  // Obtener hora actual (simulado, deberías usar RTC o NTP)
  String hora_fin = "16:00:00"; // Reemplaza con la hora real

  String httpRequestData = "{\"claseId\":" + claseId + ",\"hora_fin\":\"" + hora_fin + "}";
  Serial.println("Terminando clase: " + httpRequestData);
  int httpResponseCode = http.POST(httpRequestData);

  if (httpResponseCode == HTTP_CODE_OK) {
    Serial.println("Clase finalizada correctamente");
    mostrarMensaje("Clase finalizada");
    claseIniciada = false;
    claseId = "";
    materia = "";
    profesor = "";
    cantidadEstudiantes = 0;
  } else {
    Serial.println("Error al finalizar clase");
    mostrarError("Error al finalizar", "");
  }
  http.end();
}

void procesarRespuesta(HTTPClient &http, int httpResponseCode) {
  Serial.print("Código de respuesta HTTP: ");
  Serial.println(httpResponseCode);

  if (httpResponseCode > 0) {
    String payload = http.getString();
    Serial.println("Datos recibidos:");
    Serial.println(payload);

    DynamicJsonDocument doc(1024);
    deserializeJson(doc, payload);

    // Mostrar mensaje de error del backend solo si la respuesta no es exitosa
    if ((httpResponseCode != HTTP_CODE_OK && httpResponseCode != HTTP_CODE_CREATED) && doc.containsKey("message")) {
      String msg = doc["message"].as<String>();
      mostrarMensaje(msg);
      digitalWrite(LED_ROJO, HIGH);
      digitalWrite(BUZZER_PIN, HIGH);
      delay(1500);
      digitalWrite(LED_ROJO, LOW);
      digitalWrite(BUZZER_PIN, LOW);
      mostrarMensajeInicialAnimado();
      return;
    }

    if (httpResponseCode == HTTP_CODE_OK || httpResponseCode == HTTP_CODE_CREATED) {
      if (doc.containsKey("clase")) {
        claseIniciada = true;
        claseId = String(doc["clase"]["id"].as<int>());
        if (doc.containsKey("materia")) {
          materia = doc["materia"].as<String>();
        } else if (doc["clase"].containsKey("horario_id")) {
          materia = doc["clase"]["horario_id"].as<String>();
        } else {
          materia = "Desconocida";
        }
        if (doc.containsKey("profesor")) {
          profesor = doc["profesor"].as<String>();
        } else if (doc["clase"].containsKey("profesor_id")) {
          profesor = doc["clase"]["profesor_id"].as<String>();
        } else {
          profesor = "Desconocido";
        }
        cantidadEstudiantes = 0;
        mostrarSummary();
        digitalWrite(LED_VERDE, HIGH);
        moverServo();
        delay(1000);
        digitalWrite(LED_VERDE, LOW);
      } else if (doc.containsKey("asistencia")) {
        cantidadEstudiantes++;
        mostrarSummary();
        digitalWrite(LED_VERDE, HIGH);
        moverServo();
        delay(1000);
        digitalWrite(LED_VERDE, LOW);
      } else if (doc.containsKey("estudiante")) {
        // SOLO ABRIR PUERTA SI HAY CLASE INICIADA
        if (claseIniciada) {
          String nombre = doc["estudiante"]["nombre"].as<String>() + " " + doc["estudiante"]["apellido"].as<String>();
          mostrarMensaje("Estudiante: " + nombre);
          digitalWrite(LED_VERDE, HIGH);
          moverServo();
          delay(1000);
          digitalWrite(LED_VERDE, LOW);
        } else {
          mostrarMensaje("No hay clase iniciada");
          digitalWrite(LED_ROJO, HIGH);
          digitalWrite(BUZZER_PIN, HIGH);
          delay(1500);
          digitalWrite(LED_ROJO, LOW);
          digitalWrite(BUZZER_PIN, LOW);
          mostrarMensajeInicialAnimado();
        }
      } else if (doc.containsKey("profesor")) {
        String nombre = doc["profesor"]["nombre"].as<String>() + " " + doc["profesor"]["apellido"].as<String>();
        mostrarMensaje("Profesor: " + nombre);
        digitalWrite(LED_VERDE, HIGH);
        moverServo();
        delay(1000);
        digitalWrite(LED_VERDE, LOW);
      } else {
        mostrarMensaje("Respuesta desconocida");
        delay(2000);
        mostrarMensajeInicialAnimado();
      }
    } else if (httpResponseCode == 403) {
      mostrarError("Acceso Denegado", "");
      digitalWrite(LED_ROJO, HIGH);
      digitalWrite(BUZZER_PIN, HIGH);
      delay(1000);
      digitalWrite(LED_ROJO, LOW);
      digitalWrite(BUZZER_PIN, LOW);
      mostrarError("No estás inscrito", "en esta materia");
      delay(1500);
      mostrarMensajeInicialAnimado();
    } else {
      mostrarError("Error del servidor:", String(httpResponseCode));
      digitalWrite(LED_ROJO, HIGH);
      digitalWrite(BUZZER_PIN, HIGH);
      delay(1000);
      digitalWrite(LED_ROJO, LOW);
      digitalWrite(BUZZER_PIN, LOW);
      delay(1500);
      mostrarMensajeInicialAnimado();
    }
  } else {
    Serial.print("Error al enviar la solicitud: ");
    Serial.println(http.errorToString(httpResponseCode));
    mostrarError("Error de conexión", "");
    digitalWrite(LED_ROJO, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(1000);
    digitalWrite(LED_ROJO, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    delay(1500);
    mostrarMensajeInicialAnimado();
  }
}

void moverServo() {
  servo.write(180); // Mover el servo a 180 grados (puerta abierta)
  delay(2000); // Mantener la puerta abierta por 2 segundos
  servo.write(0); // Mover el servo de vuelta a 0 grados (puerta cerrada)
}

void mostrarMensaje(String mensaje) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Escaneo:");
  display.setCursor(0, 16);
  display.println(mensaje);
  display.display();
  delay(2000); // Mostrar el mensaje durante 2 segundos
}

void mostrarError(String mensaje, String detalle) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(mensaje);
  if (detalle.length() > 0) {
    display.setCursor(0, 16);
    display.println(detalle);
  }
  display.display();
  delay(2000); // Mostrar el mensaje de error durante 2 segundos
}

// Nuevo diseño animado para el mensaje de escanear tarjeta
void mostrarMensajeInicialAnimado() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(8, 10);
  display.println("Escanee su");
  display.setCursor(20, 32);
  display.println("tarjeta");

  // Flecha animada hacia abajo (manual)
  int baseY = 54 + (flechaFrame % 3); // animación simple
  display.drawLine(62, baseY, 62, baseY + 6, SSD1306_WHITE); // Línea vertical
  display.drawLine(58, baseY + 2, 62, baseY + 6, SSD1306_WHITE); // Diagonal izquierda
  display.drawLine(66, baseY + 2, 62, baseY + 6, SSD1306_WHITE); // Diagonal derecha

  display.display();

  // Actualiza frame de la flecha cada 250 ms
  if (millis() - lastFlechaUpdate > 250) {
    flechaFrame++;
    lastFlechaUpdate = millis();
  }
}

void mostrarSummary() {
  display.clearDisplay();

  // Título en la parte superior
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 0);
  display.print("ASISTENCIA");

  // Línea divisoria
  display.drawLine(0, 10, SCREEN_WIDTH, 10, SSD1306_WHITE);

  // Recuadro para Materia
  display.drawRect(0, 12, SCREEN_WIDTH, 16, SSD1306_WHITE);
  display.setCursor(4, 16);
  display.setTextSize(1);
  display.print("Materia: ");
  display.setTextSize(1);
  display.print((materia.length() > 14 ? materia.substring(0, 14) : materia));

  // Recuadro para Profesor
  display.drawRect(0, 30, SCREEN_WIDTH, 16, SSD1306_WHITE);
  display.setCursor(4, 34);
  display.setTextSize(1);
  display.print("Profesor: ");
  display.setTextSize(1);
  display.print((profesor.length() > 14 ? profesor.substring(0, 14) : profesor));

  // Recuadro para Asistentes
  display.drawRect(0, 48, SCREEN_WIDTH, 15, SSD1306_WHITE);
  display.setCursor(4, 52);
  display.setTextSize(1);
  display.print("Asistentes: ");
  display.setTextSize(1);
  display.setCursor(90, 53);
  display.print(cantidadEstudiantes);

  display.display();
}