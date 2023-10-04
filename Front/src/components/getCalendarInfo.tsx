import axios from "axios";
import Cookies from "js-cookie";

function GetCalendarInfo() {
  const getInfo = async () => {
    const token = Cookies.get("jwt");
    const req = await axios.get(
      "http://localhost:8000/api/v1/google/calendar/get-event", {
        headers:{
            Authorization: `Bearer ${token}` 
        }
      }
    );

    console.log(req);
  };
  return (
    <>
      <button onClick={getInfo}>Get Calendar Info</button>
    </>
  );
}

export default GetCalendarInfo;
