import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
// import axios from "axios";
import Cookies from "js-cookie";
import { SubmitHandler, useForm } from "react-hook-form";
// import jwt_decode from "jwt-decode";
import { Navigate } from "react-router-dom";

interface ExpTypes {
  status: string;
}

interface FormValues {
  email: string;
  password: string;
}

function LoginPage() {
  // const apiData = useLoaderData() as ExpTypes;
  const apiData: ExpTypes = { status: "fail" };

  // if (apiData.status === "success") {
  //   return Navigate("/dashboard");
  // }

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ code }) => {
      const response = await axios.post(
        "http://localhost:8000/api/v1/google/create-token",
        {
          code: code,
        }
      );
      console.log(response);

      if (!response) throw Error("Error during google auth");

      const tokens = await response.data.response.tokens;

      Cookies.set("code_for_credential", code, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      Cookies.set("calendar_refresh_token", tokens.refresh_token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });
      Cookies.set("access_token", tokens.access_token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });
      Cookies.set("user_id_token", tokens.id_token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      Cookies.set("jwt", response.data.token, {
        expires: new Date(
          Date.now() +
            // Number(process.env.NEXT_PUBLIC_JWT_COOKIE_EXPIRES_IN) *
            90 * 24 * 60 * 60 * 1000
        ),
      });
    },
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/calendar",
  });

  const { register, handleSubmit } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const req = await axios.post("http://localhost:8000/api/v1/users/login", {
      email: data.email,
      password: data.password,
    });

    console.log(req);
  };

  return (
    <>
      {apiData.status !== "success" ? (
        <>
          <h1>Login</h1>
          <button onClick={googleLogin}>Google auth</button>

          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="email" {...register("email")} />
            <input type="text" {...register("password")} />
            <input type="submit" />
          </form>
        </>
      ) : (
        <Navigate to={"/dashboard"} replace />
      )}
    </>
  );
}

export default LoginPage;

{
  /* <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const user: {
                  given_name: string;
                  family_name: string;
                  email: string;
                } = await jwt_decode(credentialResponse.credential!);

                const existingUser = await fetch(
                  `http://localhost:8000/api/v1/users/me`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );

                const existingUserData = await existingUser.json();

                if (existingUserData.status === "success") {
                  const res = await axios.post(
                    `http://localhost:8000/api/v1/users/login`,
                    {
                      email: user.email,
                      password: "Magari123@",
                    }
                  );
                  const data = await res.data;
                  Cookies.set("jwt", data.token, {
                    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                  });
                  location.reload();
                } else {
                  const res = await axios.post(
                    `http://localhost:8000/api/v1/users/signup`,
                    {
                      firstName: user.given_name,
                      email: user.email,
                      password: "Magari123@",
                      passwordConfirm: "Magari123@",
                    }
                  );
                  const data = await res.data;
                  Cookies.set("jwt", data.token, {
                    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                  });
                  location.reload();
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (err: any) {
                console.log(err);
              }
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          /> */
}
{
  /* <button
            onClick={async () => {
              let timer: NodeJS.Timeout | null = null;
              const googleLoginURL =
                "http://localhost:8000/api/v1/users/google";
              const newWindow = window.open(
                googleLoginURL,
                "_blank",
                "width=500,height=600"
              );

              if (newWindow) {
                timer = setInterval(() => {
                  if (newWindow.closed) {
                    console.log("Yay we're authenticated");
                    fetchAuthUser();
                    if (timer) clearInterval(timer);
                  }
                }, 500);
              }
            }}
          >
            google auth
          </button> */
}
