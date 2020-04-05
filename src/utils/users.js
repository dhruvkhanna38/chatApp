const users = [];
//adduser, removeuser, getuser, getusersinroom


const addUser = ({id, username, room})=>{
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate data
    if(!username || !room){
        return {
            error : "Username and Room anre required"
        }
    }

    const existingUser = users.find((user)=>{
            return user.room === room && user.username === username
    });

    if(existingUser){
        return {
            error :"Username is in use"
        }
    }

    //store user
    const user = {id , username , room};
    users.push(user);
    return {user};
}


const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id;
    })

    if(index!==-1){
        return users.splice(index,1)[0];
    }

}

const getUser = (id)=>{
   return users.find((user)=>{
        return user.id === id;
    });
    
}

const getUsersInRoom = (roomName)=>{
    roomName= roomName.trim().toLowerCase();
    let usersInRoom = [];
    for(let i=0;i<users.length;i++){
        if(users[i].room === roomName){
            usersInRoom.push(users[i].username);
        }
    }
    return usersInRoom;
}


module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
};