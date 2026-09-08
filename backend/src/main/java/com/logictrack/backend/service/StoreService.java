package com.logictrack.backend.service;

import com.logictrack.backend.model.Store;
import com.logictrack.backend.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    @Transactional(readOnly = true)
    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Store> getActiveStores() {
        return storeRepository.findByIsActiveTrue();
    }

    @Transactional
    public Store createStore(String name, String address, String city, String phone, String email) {
        Store store = new Store();
        store.setName(name);
        store.setAddress(address);
        store.setCity(city);
        store.setPhone(phone);
        store.setEmail(email);
        store.setActive(true);
        return storeRepository.save(store);
    }

    @Transactional
    public Store updateStore(Long id, String name, String address, String city, String phone, String email, Boolean isActive) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tienda no encontrada con ID: " + id));
        if (name != null) store.setName(name);
        if (address != null) store.setAddress(address);
        if (city != null) store.setCity(city);
        if (phone != null) store.setPhone(phone);
        if (email != null) store.setEmail(email);
        if (isActive != null) store.setActive(isActive);
        return storeRepository.save(store);
    }

    @Transactional
    public void deleteStore(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tienda no encontrada con ID: " + id));
        storeRepository.delete(store);
    }

    @Transactional(readOnly = true)
    public Store getStoreById(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tienda no encontrada con ID: " + id));
    }
}