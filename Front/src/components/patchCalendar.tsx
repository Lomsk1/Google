import axios from "axios";
import Cookies from "js-cookie";
import { SubmitHandler, useForm } from "react-hook-form";

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

function PatchCalendar() {
  const { register, handleSubmit } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const user_token = Cookies.get("jwt");

    const attendeesEmails = [
      // { email: "lomsianidzegiorgi123@gmail.com" },
      { email: "lomsianidzegiorgi123@gmail.coms" },
      // { email: "alika.shako@gmail.com" },
    ];

    const req = await axios.patch(
      `http://localhost:8000/api/v1/google/calendar/primary/events/6gl1vj0d3oljrc1cuu0bbnes86`,
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
      </form>{" "}
    </>
  );
}

export default PatchCalendar;
