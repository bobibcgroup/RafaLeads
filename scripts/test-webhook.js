#!/usr/bin/env node

const testLeads = [
  {
    session_id: "test-session-001",
    clinic_id: "clinic-001",
    name: "Sarah Johnson",
    phone: "+1234567890",
    treatment_id: "botox",
    message: "Interested in Botox for forehead lines",
    email: "sarah@example.com",
    status: "New",
    source: "website"
  },
  {
    session_id: "test-session-002",
    clinic_id: "clinic-001",
    name: "Ahmed Hassan",
    phone: "+966501234567",
    treatment_id: "filler",
    message: "Looking for cheek fillers",
    email: "ahmed@example.com",
    status: "Contacted",
    notes: "Arabic speaking client",
    lang: "AR",
    source: "facebook"
  },
  {
    session_id: "test-session-003",
    clinic_id: "clinic-001",
    name: "Maria Garcia",
    phone: "+34612345678",
    treatment_id: "laser",
    message: "Interested in laser hair removal",
    email: "maria@example.com",
    status: "Booked",
    notes: "Appointment scheduled for Friday 3PM",
    source: "instagram"
  },
  {
    session_id: "test-session-004",
    clinic_id: "clinic-001",
    name: "James Wilson",
    phone: "+447712345678",
    treatment_id: "hair",
    message: "Looking for hair restoration treatment",
    email: "james@example.com",
    status: "Converted",
    notes: "Treatment completed successfully",
    source: "referral"
  },
  {
    session_id: "test-session-005",
    clinic_id: "clinic-001",
    name: "Fatima Al-Zahra",
    phone: "+971501234567",
    treatment_id: "facial",
    message: "Interested in hydrafacial treatment",
    email: "fatima@example.com",
    status: "New",
    notes: "VIP client",
    lang: "AR",
    source: "google"
  }
];

async function addTestLeads() {
  console.log('🧪 Adding test leads...\n');
  
  for (let i = 0; i < testLeads.length; i++) {
    const lead = testLeads[i];
    
    try {
      const response = await fetch('http://localhost:3000/api/webhook/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': 'your-webhook-secret-here'
        },
        body: JSON.stringify(lead)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Lead ${i + 1}: ${lead.name} (${lead.status})`);
      } else {
        console.log(`❌ Lead ${i + 1}: ${lead.name} - ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Lead ${i + 1}: ${lead.name} - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎉 Test leads added!');
  console.log('📊 Dashboard URL: http://localhost:3000/dashboard/demo-token-123');
}

addTestLeads().catch(console.error);
