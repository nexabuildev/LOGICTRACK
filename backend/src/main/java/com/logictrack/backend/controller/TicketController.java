package com.logictrack.backend.controller;

import com.logictrack.backend.model.Ticket;
import com.logictrack.backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketRepository.findAll());
    }

    @GetMapping("/my-tickets/{email}")
    public ResponseEntity<List<Ticket>> getMyTickets(@PathVariable String email) {
        return ResponseEntity.ok(ticketRepository.findByCustomerEmail(email));
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        if (ticket.getCreatedAt() == null) {
            ticket.setCreatedAt(LocalDateTime.now());
        }
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus("OPEN");
        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    @PostMapping("/public")
    public ResponseEntity<Ticket> createPublicTicket(@RequestBody Ticket ticket) {
        if (ticket.getCreatedAt() == null) {
            ticket.setCreatedAt(LocalDateTime.now());
        }
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus("OPEN");
        ticket.setPriority("MEDIUM");
        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @RequestBody Ticket ticketDetails) {
        Optional<Ticket> opt = ticketRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        Ticket existing = opt.get();
        if (ticketDetails.getStatus() != null) {
            existing.setStatus(ticketDetails.getStatus());
            if (ticketDetails.getStatus().equals("RESOLVED") || ticketDetails.getStatus().equals("CLOSED")) {
                existing.setResolvedAt(LocalDateTime.now());
            }
        }
        if (ticketDetails.getTechnicianNotes() != null) {
            existing.setTechnicianNotes(ticketDetails.getTechnicianNotes());
        }
        if (ticketDetails.getPriority() != null) {
            existing.setPriority(ticketDetails.getPriority());
        }
        
        existing.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(ticketRepository.save(existing));
    }
}
