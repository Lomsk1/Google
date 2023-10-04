// passport.use(
//     new GoogleStrategy(
//       {
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: "http://127.0.0.1:8000/api/v1/users/google/callback",

//         scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
//       },
//       async (_accessToken, _refreshToken, profile, done) => {
//         try {
//           console.log(profile);
//           // Check if the user already exists in your database based on their Google profile ID
//           const existingUser = await User.findOne({ email: profile._json.email });

//           if (existingUser) {
//             await User.updateOne({
//               googleId: profile.id,
//             });
//             return done(null, existingUser);
//           }

//           // If the user doesn't exist, create a new user in your database
//           const newUser = new User({
//             googleId: profile.id,
//             email: profile._json.email,
//             firstName: profile._json.given_name,
//             password: "Magari123@",
//             passwordConfirm: "Magari123@",
//           });

//           await newUser.save();

//           return done(null, newUser);
//         } catch (error) {
//           return done(error, false);
//         }
//       }
//     )
//   );

//   passport.serializeUser(function (user, done) {
//     console.log("Serializing user:", user);

//     done(null, user);
//   });
//   passport.deserializeUser(async function (user, done) {
//     console.log("Error deserializing", user);

//     done(null, user);
//   });

//   // Passport middleware setup
//   app.use(passport.initialize());
//   app.use(passport.session());

// app.use((_req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS, GET, POST, PUT, PATCH, DELETE"
//   );
//   res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });
