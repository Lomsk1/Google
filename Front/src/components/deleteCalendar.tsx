import axios from "axios";
import Cookies from "js-cookie";

function DeleteCalendar() {
  const getInfo = async () => {
    const token = Cookies.get("jwt");
    const req = await axios.delete(
      `http://localhost:8000/api/v1/google/calendar/primary/events/q5ci9kjsoj07lq40b22nedjcu0`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(req);
  };
  return (
    <>
      <button onClick={getInfo}>Delete Calendar</button>
    </>
  );
}

export default DeleteCalendar;
