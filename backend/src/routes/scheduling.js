const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

/**
 * Scheduling & Physician Match Algorithm
 * Implements a weighted scoring system based on context-aware criteria
 */

router.post('/match-doctor', authenticate, authorize('receptionist', 'administrator'), async (req, res) => {
    try {
        const { patientId, specialtyRequested, preferredDate, preferredTimeSlot } = req.body;

        /**
         * WEIGHTED ALGORITHM PRESETS
         * Specialty Match: 40 pts
         * Availability: 30 pts
         * Workload Balance: 20 pts
         * Patient Continuity: 10 pts
         */

        // --- MONGOOSE QUERIES (Ready to uncomment when models are finalized) ---

        /*
        const doctors = await User.find({ 
          role: 'doctor', 
          status: 'active' 
        });
        
        const appointments = await Appointment.find({
          date: preferredDate,
          status: { $ne: 'cancelled' }
        });
        
        const historicAssignments = await Assignment.find({
          patient: patientId
        });
        */

        // MOCK DATA FOR ENGINE DEMONSTRATION
        const mockDoctors = [
            { id: 'D1', name: 'Dr. Sarah Wilson', specialty: 'Cardiology', currentLoad: 8, maxLoad: 10, availability: ['09:00', '10:00', '11:00'] },
            { id: 'D2', name: 'Dr. James Chen', specialty: 'General Medicine', currentLoad: 3, maxLoad: 10, availability: ['09:00', '14:00'] },
            { id: 'D3', name: 'Dr. Robert Miller', specialty: 'Pediatrics', currentLoad: 6, maxLoad: 10, availability: ['15:00', '16:00'] }
        ];

        const results = mockDoctors.map(doctor => {
            let score = 0;
            const breakdown = { specialty: 0, availability: 0, workload: 0, continuity: 0 };

            // 1. Specialty Match (40 pts)
            if (doctor.specialty === specialtyRequested) {
                score += 40;
                breakdown.specialty = 40;
            } else if (specialtyRequested === 'General Medicine') {
                score += 20;
                breakdown.specialty = 20;
            }

            // 2. Availability Match (30 pts)
            // Logic assumes check against existing appointments
            const hasSlot = doctor.availability.includes(preferredTimeSlot);
            if (hasSlot) {
                score += 30;
                breakdown.availability = 30;
            } else {
                score += 10; // Partial credit for same day different time
            }

            // 3. Workload Balance (20 pts)
            const loadPercentage = (doctor.currentLoad / doctor.maxLoad);
            const workloadScore = Math.round(20 * (1 - loadPercentage));
            score += workloadScore;
            breakdown.workload = workloadScore;

            // 4. Patient Continuity (10 pts)
            // Logic: If doctor has treated patient before
            const hasHistory = false; // logic would check historicAssignments
            if (hasHistory) {
                score += 10;
                breakdown.continuity = 10;
            }

            return {
                doctorId: doctor.id,
                doctorName: doctor.name,
                specialty: doctor.specialty,
                totalScore: score,
                scoreBreakdown: breakdown,
                recommendationLevel: score >= 80 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW'
            };
        });

        // Rank by total score
        results.sort((a, b) => b.totalScore - a.totalScore);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            matchCount: results.length,
            data: results
        });

    } catch (error) {
        console.error('Matching Algorithm Error:', error);
        res.status(500).json({
            success: false,
            message: 'Critical error in matching engine'
        });
    }
});

module.exports = router;
