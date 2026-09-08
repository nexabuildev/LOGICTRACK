# 📦 LogiTrack ERP - Sistema de Gestión de Inventario

LogiTrack ERP es una aplicación web *Full-Stack* orientada a SaaS (Software as a Service) diseñada para la gestión eficiente de inventarios y control de existencias. Proporciona un panel de control intuitivo y seguro para registrar, monitorizar y administrar productos en tiempo real.

## 🎯 ¿Por qué y para qué existe este proyecto?

Este proyecto nace como la culminación práctica del ciclo de **Desarrollo de Aplicaciones Multiplataforma**, aplicando arquitecturas modernas y patrones de diseño empresariales. Su objetivo principal es resolver un problema real del sector comercial (el descontrol de stock) mediante una plataforma escalable.

Al mismo tiempo, LogiTrack actúa como una demostración técnica de capacidades *Full-Stack* de nivel profesional, ideal tanto para implementaciones a clientes reales como servicios freelance, demostrando dominio sobre todo el ciclo de vida del software: desde el diseño de la base de datos hasta el despliegue del frontend.

## ✨ Características Principales

* **Autenticación y Seguridad:** Sistema de registro y login seguro utilizando Spring Security y encriptación de contraseñas con BCrypt.
* **Dashboard Interactivo:** Interfaz de usuario moderna y minimalista que muestra el estado del inventario en tiempo real.
* **Gestión de Catálogo:** Creación y visualización de productos con control de SKU, precios y niveles de stock.
* **Arquitectura SPA:** Navegación fluida sin recargas de página gracias a React Router DOM.
* **Diseño Responsivo:** Interfaz adaptable a diferentes tamaños de pantalla utilizando Tailwind CSS.

## 🛠️ Stack Tecnológico

El proyecto está dividido en dos capas claramente separadas (Frontend y Backend) que se comunican mediante una API REST.

### Frontend
* **Core:** React 18 + Vite
* **Enrutamiento:** React Router DOM
* **Estilos:** Tailwind CSS
* **Arquitectura:** Feature-based routing & components

### Backend
* **Core:** Java + Spring Boot
* **Seguridad:** Spring Security
* **Acceso a Datos:** Spring Data JPA / Hibernate
* **Base de Datos:** PostgreSQL

## 🚀 Instalación y Despliegue Local

### Requisitos previos
* Node.js (v18 o superior)
* Java JDK 17 o superior
* PostgreSQL instalado y ejecutándose
* Maven

### Configuración del Backend (Spring Boot)
1. Clona este repositorio.
2. Abre la carpeta del backend en tu IDE (IntelliJ IDEA recomendado).
3. Configura tus credenciales de PostgreSQL en el archivo `application.properties`.
4. Ejecuta la clase principal `BackendApplication.java`. El servidor arrancará en `http://localhost:8080`.

### Configuración del Frontend (React/Vite)
1. Abre una terminal y navega a la carpeta `frontend`.
2. Instala las dependencias:
   ```bash
   npm install