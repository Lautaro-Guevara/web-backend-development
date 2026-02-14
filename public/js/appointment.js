
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('appointment_date');
    const employeeSelect = document.getElementById('representative');
    const timeSelect = document.getElementById('appointment_time');
    
    // Función para actualizar las opciones de horario
    async function updateTimeOptions() {
        const employeeId = employeeSelect.value;
        const appointmentDate = dateInput.value;
        
        if (!employeeId || !appointmentDate) {
            timeSelect.innerHTML = '<option value="">Select a date and representative first</option>';
            timeSelect.disabled = true;
            return;
        }
        
        try {
            const response = await fetch(`/appointments/available-times?employee_account_id=${employeeId}&appointment_date=${appointmentDate}`);
            const data = await response.json();
            
            if (data.success) {
                timeSelect.innerHTML = data.options;
                timeSelect.disabled = false;
            } else {
                timeSelect.innerHTML = '<option value="">No available times</option>';
                timeSelect.disabled = true;
            }
        } catch (error) {
            console.error('Error updating time options:', error);
            timeSelect.innerHTML = '<option value="">Error loading available times</option>';
            timeSelect.disabled = true;
        }
    }
    
    // Event listeners para ambos campos
    dateInput.addEventListener('change', updateTimeOptions);
    employeeSelect.addEventListener('change', updateTimeOptions);
});
