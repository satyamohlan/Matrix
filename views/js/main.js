const form=document.getElementById('chatter');
const input = document.getElementById('message');
const addFriendBtnclose=document.getElementById('UserAdd');
const classpopupbtn=document.getElementById('friend-adder-popup-closer-btn');
const addFriendbtn=document.querySelectorAll('div.chadder div.room button.btn');
const sidebar=document.querySelector('.p-info');
const siderbarBtn=document.getElementById('sidebar-btn');
const siderbarBtnIcon=document.querySelector('#sidebar-btn .fas');
let sidebarOpen=false;
siderbarBtn.addEventListener('click',() => {
  if(!sidebarOpen){
  siderbarBtnIcon.classList.replace('fa-bars','fa-times');
  sidebar.style.display='grid';
  sidebarOpen=true;
}
  else{
    siderbarBtnIcon.classList.replace('fa-times','fa-bars');
    sidebar.style.display='none';    
    sidebarOpen=false;
  }
});
addFriendBtnclose.addEventListener('click',()=>{

  document.querySelector('.adder').style.display='block';
  classpopupbtn.addEventListener('click',()=>{
    document.querySelector('.adder').style.display='none';   
  })
})
addFriendbtn.forEach(button => {
  button.addEventListener('click',()=>{
    
    button.innerHTML='Requested';
    button.classList.replace('btn-primary','btn-dark')
  });
});
const socket = io();
socket.emit('join room',{room:'room'})
form.addEventListener('submit', function(e) {
  e.preventDefault();

  if (input.value) {
    var msg={};
    msg.message=e.target.elements.message.value;
    socket.emit('chat message',msg);

    e.target.elements.message.value = '';
    e.target.elements.message.focus();
    
  }
});

socket.on('chat message', function(msg) {
  AddMessage(msg);
});
function AddMessage(msg) {
  const chat=document.querySelector('.chat-history');
  console.log(msg);
  var item = document.createElement('div');
  item.classList.add('message');
  if(msg.self){
    item.classList.add('self')
  }
  item.innerHTML=`<p class='meta'>${msg.from} <span>${msg.disptime}</span></p><p class='text'>${msg.message}</p>`;
  
  chat.appendChild(item);
  chat.scrollTop=chat.scrollHeight;

}