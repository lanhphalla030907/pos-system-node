import { useEffect, useState } from "react";
import { request } from "../../util/helper";
import HomeGrid from "../../components/home/HomeGrid";


const HomePage = () => {

useEffect(()=> {
  getList();
} , []);
  const [home, setHome] = useState([]);
  const getList = async ()=> {
    const res= await request("home" , "get");
    // console.log(res);
    if(res) {
      setHome(res.list); 
    }
  }
  return (
    <div>
      <HomeGrid data={home}/>
    </div>
  );
};

export default HomePage;
