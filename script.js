const form = document.getElementById('cabinForm');
    const dateInput = document.getElementById('date');
    const timeSlots = document.getElementById('timeSlots');
    const customSlotMaker = document.getElementById('customSlotMaker');
    const messageBox = document.getElementById('messageBox');
    const saveButton = document.getElementById('saveButton');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const messageInput=document.getElementById('message')
    const heading=document.getElementById('heading');
    const notify=document.getElementById("notification");
    const times = [
        { startTime: '9:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '11:00' },
        { startTime: '11:00', endTime: '12:00' },
        { startTime: '12:00', endTime: '13:00' },
        { startTime: '14:00', endTime: '15:00' },
        { startTime: '15:00', endTime: '16:00' },
        { startTime: '16:00', endTime: '17:00' },
        { startTime: '17:00', endTime: '18:00' }
    ]
    ;
document.addEventListener("DOMContentLoaded", function () {
    dateInput.addEventListener('change', function () {
        const selectedDate = new Date(dateInput.value);
        const dayOfWeek = selectedDate.getUTCDay(); 
        if (dayOfWeek === 0) {
            timeSlots.innerHTML = '<p>It is a Sunday</p>';
        } else {
            generateTimeSlots();
        }
        messageInput.value='';
        timeSlots.classList.remove('hidden');
        customSlotMaker.classList.remove('hidden');
        messageBox.classList.remove('hidden');
        saveButton.classList.remove('hidden');
        heading.classList.remove('hidden');
    });
    function generateTimeSlots() {
        timeSlots.innerHTML = '';
        let i=0
            times.forEach(time => {
            const slotDiv = document.createElement('div');
            slotDiv.classList.add('slot');
            slotDiv.style.textAlign="center"
            slotDiv.id=i;
            i+=1;
            slotDiv.innerText = `${time.startTime} : ${time.endTime}`;
            timeSlots.appendChild(slotDiv);
        });
        let slots=document.querySelectorAll('.slot');
        select(slots);
        
    }

    startTimeInput.addEventListener('change', function () {
        const startTime = startTimeInput.value;
        endTimeInput.innerHTML = '';
        const startHour = parseInt(startTime.split(':')[0], 10);
        const startMinute = parseInt(startTime.split(':')[1], 10);

        for (let hour = startHour; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                if (hour === startHour && minute <= startMinute) continue;

                const formattedHour = hour < 10 ? `0${hour}` : hour;
                const formattedMinute = minute < 10 ? `0${minute}` : minute;
                const option = document.createElement('option');
                option.value = `${formattedHour}:${formattedMinute}`;
                option.text = `${formattedHour}:${formattedMinute}`;
                endTimeInput.appendChild(option);
            }
        }
    });

    const addSlotBtn = document.getElementById('addSlot');
    addSlotBtn.addEventListener('click', function () {
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;

        if (startTime && endTime && startTime < endTime) {
            createFreeslot(startTime,endTime);
        } else {
            alert('Please select valid start and end times.');
        }
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        dateInput.value = '';
        messageInput.value='';
        timeSlots.innerHTML = '';
        customSlotMaker.classList.add('hidden');
        messageBox.classList.add('hidden');
        saveButton.classList.add('hidden');
        timeSlots.classList.add('hidden');
        heading.classList.add('hidden');
    });
});
function formatTime(time) {
    const [hour, minute] = time.split(':');
    let formattedHour = parseInt(hour, 10);
    const period = formattedHour >= 12 ? '' : '';

    if (formattedHour === 0) formattedHour = 12;
    else if (formattedHour > 12) formattedHour -= 12;

    return `${formattedHour}:${minute} ${period}`;
}

let freeSlots=[];
const select=function(slots){
    slots.forEach(slot=>{
        slot.addEventListener('click',()=>{
            let idx=parseInt(slot.id)
            const targetSlot={...times[idx],slotNo:idx};
            const index = freeSlots.findIndex(
                (slot) =>
                  slot.startTime === targetSlot.startTime &&
                  slot.endTime === targetSlot.endTime &&
                  slot.slotNo === targetSlot.slotNo
              );
            if(index!==-1){
                freeSlots.splice(index,1);
            }else{
            freeSlots.push(targetSlot);
            }
            slot.classList.toggle('selectedSlot');
        })
    })
}
const createFreeslot=function(startTime,endTime){
    const customSlot = document.createElement('div');
    customSlot.classList.add('slot');
            customSlot.classList.add('selectedSlot');
            customSlot.innerText = `${startTime} - ${endTime}`;
            const deletebtn = document.createElement('button');
            deletebtn.innerText="Delete";
            deletebtn.classList.add("deleteBtn");
            freeSlots.push({"startTime":`${startTime}`,"endTime":`${endTime}`,slotNo:8});
            customSlot.appendChild(deletebtn);
            timeSlots.appendChild(customSlot);
            startTimeInput.value = '';
            endTimeInput.value = '';
            deletebtn.addEventListener('click', function () {
                const temp=this.parentElement.innerText;
                const timeRange = temp.substring(0,temp.length-7);
                const [start, end] = timeRange.split(" - ").map(t => t.trim());
                const index = freeSlots.findIndex(slot => slot.startTime === start && slot.endTime === end);
                freeSlots.splice(index,1);

                customSlot.remove();
                
            });
}

const populateSlots=function(result){
    document.getElementById('message').value=result.message;
    const savedSlots=result.freeSlots;
    savedSlots.forEach(ele => {
        if(ele.slotNo<8){
            let slot=document.getElementById(ele.slotNo);
            slot.classList.add('selectedSlot');
            freeSlots.push({...times[ele.slotNo],slotNo:ele.slotNo});
        }
        else{
            createFreeslot(ele.startTime,ele.endTime);
        }
   
    });
    
}
const showNotification=function(message){
    notify.classList.remove('hidden');
    notify.innerText=message;
    setTimeout(()=>{
        notify.innerText='';
        notify.classList.add('hidden');
    },3000)
}


async function fetchAvailability(date) {
    try {
        const response = await fetch(`https://cabinconnect.netlify.app/.netlify/functions/availability?date=${date}`);
        const result = await response.json();
        if (response.ok) {
            showNotification("Data found!")
            console.log(result);
            populateSlots(result);
        } else {
            showNotification("Enter new data!")
            console.log(result.message);
        }
    } catch (error) {
        console.error("Error fetching availability:", error);
    }
}
async function saveAvailability(date, freeSlots, message) {
    try {
        const response = await fetch(`https://cabinconnect.netlify.app/.netlify/functions/availability`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ date, freeSlots, message })
        });
        const result = await response.json();
        if (result.success) {
            console.log("Data saved successfully:", result.message);
            alert("Data saved successfully")
        } else {
            console.log("Error saving data:", result.message);
        }
    } catch (error) {
        console.error("Error saving availability:", error);
    }
}

document.getElementById('date').addEventListener('change', function () {
    const selectedDate = this.value;
    freeSlots=[];
    fetchAvailability(selectedDate);
});

document.getElementById('saveButton').addEventListener('click', function () {
    const date = document.getElementById('date').value;
    const message = messageInput.value;
    saveAvailability(date, freeSlots, message);
});

