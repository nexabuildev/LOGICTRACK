package com.logictrack.backend.service;

import com.logictrack.backend.dto.ProductRequestDTO;
import com.logictrack.backend.model.Product;
import com.logictrack.backend.model.User;
import com.logictrack.backend.repository.AuditLogRepository;
import com.logictrack.backend.repository.ProductRepository;
import com.logictrack.backend.repository.StockTransactionRepository;
import com.logictrack.backend.repository.StoreRepository;
import com.logictrack.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    // 1. Mockeamos TODAS las dependencias que usa ProductService
    @Mock
    private StoreRepository storeRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private StockTransactionRepository stockTransactionRepository;

    // 2. Inyectamos los mocks en el servicio que vamos a probar
    @InjectMocks
    private ProductService productService;

    private ProductRequestDTO dtoBasico;
    private User usuarioPrueba;

    // Se ejecuta antes de cada test para tener datos limpios
    @BeforeEach
    void setUp() {
        dtoBasico = new ProductRequestDTO(
                "SKU-123", "Laptop", "Descripción", new BigDecimal("1000.00"),
                10, 2, "SN-111", "NUEVO", "{}", "test@correo.com", null);

        usuarioPrueba = new User();
        usuarioPrueba.setEmail("test@correo.com");
    }

    // -------------------------------------------------------------------
    // PRUEBA 1: Forzar error al crear - SKU Duplicado
    // -------------------------------------------------------------------
    @Test
    void testCreateProduct_CuandoSkuYaExiste_DebeLanzarExcepcion() {
        // PREPARACIÓN: Simulamos que la base de datos dice "Sí, el SKU ya existe"
        when(productRepository.existsBySku("SKU-123")).thenReturn(true);

        // EJECUCIÓN Y VERIFICACIÓN: Esperamos que lance tu IllegalArgumentException
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            productService.createProduct(dtoBasico);
        });

        assertEquals("Ya existe un producto con el SKU: SKU-123", exception.getMessage());

        // Verificamos que NO se intentó guardar nada en la BD
        verify(productRepository, never()).save(any());
    }

    // -------------------------------------------------------------------
    // PRUEBA 2: Forzar error al crear - Stock negativo
    // -------------------------------------------------------------------
    @Test
    void testCreateProduct_CuandoStockEsNegativo_DebeLanzarExcepcion() {
        // PREPARACIÓN: El repositorio dice que el SKU NO existe (pasa la primera
        // validación)
        when(productRepository.existsBySku("SKU-ERROR")).thenReturn(false);

        // Creamos un DTO aposta con stock -5
        ProductRequestDTO dtoMalo = new ProductRequestDTO(
                "SKU-ERROR", "Raton", "Desc", new BigDecimal("20.00"),
                -5, 2, "SN-222", "NUEVO", "{}", "test@correo.com", null);

        // EJECUCIÓN Y VERIFICACIÓN
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            productService.createProduct(dtoMalo);
        });

        assertEquals("El stock no puede ser inferior a 0", exception.getMessage());
    }

    // -------------------------------------------------------------------
    // PRUEBA 3: Éxito total - Crear producto correctamente
    // -------------------------------------------------------------------
    @Test
    void testCreateProduct_DatosCorrectos_DebeGuardarYRegistrarAuditoria() {
        // PREPARACIÓN: Configurar los mocks para un camino "feliz"
        when(productRepository.existsBySku(dtoBasico.sku())).thenReturn(false);
        when(userRepository.findByEmail(dtoBasico.userEmail())).thenReturn(Optional.of(usuarioPrueba));

        // Simulamos que al guardar, la BD nos devuelve el producto con todo asignado
        Product productoGuardado = new Product();
        productoGuardado.setSku(dtoBasico.sku());
        productoGuardado.setName(dtoBasico.name());
        productoGuardado.setStockQuantity(dtoBasico.stockQuantity());
        when(productRepository.save(any(Product.class))).thenReturn(productoGuardado);

        // EJECUCIÓN
        Product resultado = productService.createProduct(dtoBasico);

        // IMPRIMIR PARA VERLO EN TERMINAL
        System.out.println("=== RESULTADO DE LA PRUEBA ===");
        System.out.println("SKU generado: " + resultado.getSku());
        System.out.println("Nombre: " + resultado.getName());
        System.out.println("==============================");

        // VERIFICACIÓN
        assertNotNull(resultado);
        assertEquals("SKU-123", resultado.getSku());

        // Verificamos que se han llamado a los métodos save() de los repositorios
        // secundarios (Kardex y Logs)
        verify(auditLogRepository, times(1)).save(any());
        verify(stockTransactionRepository, times(1)).save(any());
    }

    // -------------------------------------------------------------------
    // PRUEBA 4: Forzar error en compra - Stock insuficiente
    // -------------------------------------------------------------------
    @Test
    void testBuyProduct_CuandoNoHaySuficienteStock_DebeLanzarExcepcion() {
        // PREPARACIÓN
        Long productId = 1L;
        Product productoEnVenta = new Product();
        productoEnVenta.setStockQuantity(2); // Solo quedan 2 unidades

        when(productRepository.findById(productId)).thenReturn(Optional.of(productoEnVenta));

        // EJECUCIÓN: Intentamos comprar 5 unidades
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            productService.buyProduct(productId, 5, "cliente@correo.com");
        });

        // VERIFICACIÓN
        assertTrue(exception.getMessage().contains("Stock insuficiente para realizar la compra"));
    }
}