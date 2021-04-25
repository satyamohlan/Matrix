var username=document.querySelector('.username');
var doc=document.querySelector('.form-group.checker');
var divide=document.createElement('div');
document.querySelector('#setin').addEventListener('submit',submit);
username.addEventListener('input',check);
async function check(){
  var errors=[]

console.log(username.value);
  divide.innerHTML='';
if(username.value==''){
  errors.push(['Please enter a Username',false]);

  Addmessage(errors);
  return errors;
}
 if(username.value.length<6){
  errors.push(['Username shall atleast be 6 Characters long.',false]);
}
if(username.value.length>20){
  errors.push(['Username can not be more that 20 Characters long.',false]);
}
if(checkspecial(username.value)){
  errors.push(['Username should not contain Special Characters',false]);
}
if(errors.length!=0){
Addmessage(errors);
return false;
}
const response=await fetch('/checkusername?str='+username.value, {
  method: 'get',
  headers: {'Content-Type': 'application/json'},
  
});
const data = await response.json();
console.log(data);
var {message,success}=data;
errors.push([message,success]);
  Addmessage(errors);
  return true;
}
function checkspecial(str){
  var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return format.test(str);
}
function Addmessage(str) {

  str.forEach(str=>{
  var alert=document.createElement('div');
  alert.classList.add('alert');
  if(str[1]==false){
    alert.classList.add('alert-warning');
  }
  if(str[1]==true){
    alert.classList.add('alert-success');
  }
  alert.innerHTML=str[0];
  divide.append(alert);
});

doc.insertBefore(divide, doc.childNodes[0]);
}
async function submit(e) {
  e.preventDefault();
  var state=await check();
if(state){
  $.post('/updateinfo',{
    username:username.value
  },(err,json)=>{
    const{success}=json;
    if(json=='success'){
      document.location.replace('/');
    }
  })
}

}
