package com.logictrack.backend.repository;

import com.logictrack.backend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCustomerEmail(String email);
    List<Ticket> findByStatusNot(String status);
}
