import axios from "axios";
import { useForm, SubmitHandler } from "react-hook-form";
import Cookies from "js-cookie";
import GetCalendarInfo from "../components/getCalendarInfo";
import DeleteCalendar from "../components/deleteCalendar";
import PatchCalendar from "../components/patchCalendar";

type FormValues = {
  summary: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  colorId: string;
  meetLink: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any;
};

function CalendarPage() {
  const { register, handleSubmit } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const user_token = Cookies.get("jwt");

    const attendeesEmails = [
      // { email: "lomsianidzegiorgi123@gmail.com" },
      { email: "lomsianidzegiorgi123@gmail.coms" },
      // { email: "alika.shako@gmail.com" },
    ];

    const req = await axios.post(
      "http://localhost:8000/api/v1/google/calendar/create-event",
      {
        summary: data.summary,
        description: data.description,
        location: data.location,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        colorId: data.colorId,
        meetLink: data.meetLink,
        attendeesEmails: attendeesEmails,
        document: data.file[0],
      },
      {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      }
    );

    console.log(req);
  };

  return (
    <>
      <h1>Calendar</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" {...register("summary")} placeholder="summary" />
        <input
          type="text"
          {...register("description")}
          placeholder="description"
        />
        <input type="text" {...register("location")} placeholder="location" />
        <input type="text" {...register("colorId")} placeholder="colorId" />
        {/* <input type="text" {...register("meetLink")} placeholder="colorId" /> */}

        <fieldset>
          <legend>Check if u want Meet</legend>
          <input type="checkBox" {...register("meetLink")} id="meetLink" />
        </fieldset>
        <input type="file" {...register("file")} />

        <input
          type="datetime-local"
          {...register("startDateTime")}
          placeholder="startDateTime"
        />
        <input
          type="datetime-local"
          {...register("endDateTime")}
          placeholder="endDateTime"
        />

        <input type="submit" />
      </form>

      <hr />
      <hr />
      <br />
      <br />
      <hr />
      <hr />
      <GetCalendarInfo />
      <hr />
      <hr />
      <br />
      <br />
      <hr />
      <hr />
      <DeleteCalendar />
      <hr />
      <hr />
      <br />
      <br />
      <hr />
      <hr />
      <PatchCalendar />
    </>
  );
}

export default CalendarPage;
