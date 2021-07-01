import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [showClose, setshowClose] = useState(false);
  const [showSuggestion, setShowSuggestion]=useState(false);
  const [cityName, setCityName] = useState("");
  const [data, setData] = useState([]);
  const [cursor,setCursor]= useState(-1);
  const clickElement=useRef(null);

  let lrucache=new Array(5);

  //for api call
  useEffect(() => {
    // fetchDataApi(cityName);
    if(showSuggestion){
      apiCallOptimise(cityName);
    }
  }, [showSuggestion, cityName])

  //get data from api
  function fetchDataApi(searchText){
    if (searchText.length >= 3) {
      axios.get(`https://www.oyorooms.com/api/amp/ampautocomplete?region=1&additionalFields=rating,supply,trending,tags,category&query=${searchText}`).then(
        (res) => {
          console.log("api call");
          setCursor(-1);
          setData(res.data.responseObject);
          setShowSuggestion(true);
          lru(searchText);
        }
      )
    } else {
      setShowSuggestion(false);
    }
  }

  const debounce=(func)=>{
    let timer;

    return function(...args){
      const context=this;
      // args=arguments;
      if(timer){
        clearTimeout(timer);
      }
      
      timer= setTimeout(()=>{
          timer=null;
          func.apply(context,args);
      },300);
    }
  }

  const apiCallOptimise=useCallback(debounce(fetchDataApi),[])

  function lru(inputData){

    // lrucache[0]=inputData;
    let available=false,empty=false;
    let index=0,empindex;

    //check inputdata is available or not
    for(let i=0;i<5;i++){
      if(lrucache[i] === inputData){
        available=true;
        index=i;
        // console.log("enter in equal "+index);
        break;
      }else if(lrucache[i] === undefined){
        console.log(data);
        sessionStorage.setItem(inputData,JSON.stringify(data));
        lrucache[i]=inputData;
        index=i;
        empty=true;
        // console.log("empty");
        break;
      }
    }
    
    for(let i=0;i<5;i++){
      if(lrucache[i] === undefined){
        empindex=i;
        empty=true;
        // console.log(empindex);
        break;
        
      }
    }

    if(empty){
        if(available){
          for(let i=index+1;i<empindex;i++){
            lrucache[i-1]=lrucache[i];
          }
          lrucache[empindex-1]=inputData;
          console.log("empty and available");
        }
    }
    else{
      if(available){
        for(let i=index+1;i<5;i++){
          lrucache[i-1]=lrucache[i];
        }
        lrucache[4]=inputData;
        console.log("not empty and available");
      }
      else if(!empty){
        console.log(lrucache[0]);
        sessionStorage.removeItem(lrucache[0]);

        for(let i=1;i<5;i++){
          lrucache[i-1]=lrucache[i];
        }
        lrucache[4]=inputData;
        sessionStorage.setItem(inputData,JSON.stringify(data));
        console.log("not empty and not available remove item 1");
      }
    }

      console.log(lrucache+" lru ");
  }

  //for esc key
  useEffect(() => {
    document.addEventListener("keydown", escFunction);

    return () => {
      document.removeEventListener("keydown", escFunction);
    };
  }, []);

  const escFunction = (event) => {
    if (event.keyCode === 27) {
      setShowSuggestion(false);
    }
  };

  //click suggestion list
  useEffect(() => {
    document.addEventListener("click", showData);

    return () => {
      document.removeEventListener("click", showData);
    };
  }, []);

   const showData = (event) => {
    if(event.target.className === "suggested"){   
      console.log('className', event.target.className);
      setShowSuggestion(false);
      setCityName(event.target.textContent);

    }else if(event.target.id === "input"){
      console.log('id', event.target.id);
    }else{
      console.log('ELSE PART', event.target);
      setShowSuggestion(false);
    }
};

  //for close icon
  function handleChange(event) {
    console.log('on Change event', event.target.value);
    setCityName(event.target.value);

    if((event.target.value).length>=3){
      setShowSuggestion(true);
    }

    setCursor(-1);

    if (event.target.value !== "") {
      setshowClose(true);
      
    } else {
      setshowClose(false);
    }
  }

  //clear input 
  function clearInput() {
    setCityName("");
    setshowClose(false);
  }

  //keyboard Navigation
  function keyboardNavigation(event) {
    if(event.key === "ArrowDown"){
      // console.log("key down");

      if(cursor<data.length-1){
        setCursor(cursor+1);
      }else{
        setCursor(0);
      }

    }else if(cursor>-1 && event.key === "Enter"){
      setCityName(data[cursor].displayName);
      setShowSuggestion(false);
    }
  }

  //background Color
  const background={
    backgroundColor: 'rgb(154, 141, 230)'
  }


  return (
    <>
    <h2 id="heading">Auto complete for Cities</h2>
    <h4 id="warning">For Running App on you local machine Please off Browser CORS </h4>
    <div className="container">
      <div className="inputIcon">
        <input id="input" type="text" placeholder="Enter here" onChange={handleChange} value={cityName}
         onKeyDown={keyboardNavigation}
        ></input>
        {showClose && <i className="fa fa-times-circle" id="icon" onClick={clearInput}></i>}
      </div>

      {showSuggestion && <div className={`suggestionList`} ref={clickElement} >
        {
          data.map(
            (item, index) => {
              return (
                <div key={`suggest${index}`}
                 className="suggested" style={cursor===index? background:null}>{item.displayName}</div>
              )
            }
          )}
      </div>
    }
    </div>
  </>
  );
}

export default App;
