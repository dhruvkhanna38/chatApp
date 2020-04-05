
const socket = io();

//elements
const $messageForm =  document.querySelector("#sendFormData");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#sendLocation");
const $messages = document.querySelector("#messages");


//templates
const messageTemplate = document.querySelector("#messageTemplate").innerHTML;
const locationTemlate = document.querySelector("#locationTemplate").innerHTML;
const sidebarTemplate = document.querySelector("#sidebarTemplate").innerHTML;

//options
const {username , room } = Qs.parse(location.search , {ignoreQueryPrefix : true});

// socket.on("countUpdated" , (count)=>{
//     console.log("Count has been updated " , count);
// });

const autoScroll = ()=>{
    //new message element
    const $newMessage = $messages.lastElementChild;

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = $messages.offsetHeight;

    //height of the messages container
    const containerHeight = $messages.scrollHeight;

    //how far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on("message" , (str)=>{
    console.log(str);
    const html = Mustache.render(messageTemplate , {
        username : str.username,
        message : str.text,
        createdAt : moment(str.createdAt).format('h:mm A')
    });
    $messages.insertAdjacentHTML('beforeend' , html);
    autoScroll();

})

socket.on("locationMessage" , (str)=>{
    console.log(str);
    const html = Mustache.render(locationTemlate , {
        username : str.username,
        url : str.url, 
        createdAt : moment(str.createdAt).format('h:mm A')
    });
    $messages.insertAdjacentHTML('beforeend' , html);
    autoScroll();
});

socket.on("roomData" , ({room , users})=>{
    console.log(users);
    console.log(room);
    const html = Mustache.render(sidebarTemplate , {
        room,
        users
    });
    document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit" , (e)=>{
    e.preventDefault();
    $messageFormButton.setAttribute("disabled" , "disabled");

    const message = e.target.elements.message.value;
    socket.emit("sendMessage" , message , (error)=>{
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value ='';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }
        console.log("The message was recieved");
    });
});
$sendLocationButton.addEventListener("click" , ()=>{
    if(!navigator.geolocation){
        return alert("Geolocation us not supported");
    }

    $sendLocationButton.setAttribute("disabled" , "disabled");

    navigator.geolocation.getCurrentPosition((position)=>{
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const pos = {latitude , longitude};
        socket.emit("sendLocation" , pos, ()=>{
            $sendLocationButton.removeAttribute("disabled");
            console.log("Location Shared!!");
        });
    });
});

socket.emit("join" , {username , room},(error)=>{
    if(error){
        alert(error);
        location.href='/';
    }
});