$('.date').datepicker({
    multidate: false,
    minDate: 0,
    
});
 const mybtn=document.querySelector(".mybtn");
 const myInput=document.querySelector(".date");
 const cards=document.querySelector(".cards");
 const cardList=[];
 const clearsButton=document.querySelector(".mybtn-clear");

 cards.addEventListener("click",(e)=>{
  if(e.target.className==="fas fa-trash")
  {
      removeElement(e.target);
  }
})

function removeElement(target)
{
    const name=(target.parentElement.textContent);
    const index = cardList.indexOf(name);
    if (index !== -1){cardList.splice(index, 1);}
    
    target.parentElement.parentElement.parentElement.remove();
}

 mybtn.addEventListener("click",()=>
 {
    cards.innerHTML="";
    cardList.splice(0,cardList.length);
 })

 myInput.addEventListener("focus",function(e){

    if(e.target.value!="")
    {   
        if(!cardList.includes(e.target.value))
        {
        cardList.push(e.target.value);
        console.log(cardList);
        cards.innerHTML="";
        writeInList(cardList);
        }
    }

 });
 
 function existInList(value)
 {
    cardList.forEach(element=>{
        if(element===value)
        {   
            return true;
        }
       
    })
  
    return false;
 }

 function getDayName(dateStr, locale){
var date = new Date(dateStr);
console.log(date);
return date.toLocaleDateString(locale, { day: 'numeric', month: 'numeric', year: 'numeric', weekday: 'long' });        
}



  function writeInList(list)    
  { 
      
      list.forEach(element => {
        
        cards.innerHTML+=`
  <div class="card mb-2 mt-2 border-success" style="min-width: 160px !important; width:350px !important; ">
     <div class="card-body">
        
         <h3 class="card-title">${getDayName(element, "tr")}<i class="fas fa-trash" style="margin-left:25px"></i></h3>
         
            <div class="md-form">
            <input type="time" id="inputMDEx1" class="form-control">
            <label for="inputMDEx1">Başlangıç saati</label>
        
         
         </div>
            <input type="time" id="inputMDEx1" class="form-control">
            <label for="inputMDEx1">Bitiş saati</label>
         </div>
 </div>
  `;    });
  }
 