// Exercise library — movement vocabulary the fitness plans compose from.
// Plans reference these by `id` (see plans.ts `exercises`), so a movement is
// defined exactly once here.
//
// SOURCE: yuhonas/free-exercise-db (https://github.com/yuhonas/free-exercise-db),
// released under the Unlicense — PUBLIC DOMAIN, no attribution required. Data is
// used exactly as provided by the source; the photos are self-hosted under
// public/exercises/<id>/. This replaces the prior exercise art, which was licensed
// non-commercial only and therefore incompatible with a commercial site.
//
// `formCue` is a short human-authored coaching cue to be filled in later; it is
// undefined on every entry for now. Until then the UI renders the first steps of
// `instructions` instead.
//
// Data only. No UI, no React.

export type ExerciseLevel = "beginner" | "intermediate" | "expert";

export type Exercise = {
  id: string;
  name: string;
  /** Self-hosted photo paths under /public (public-domain source). */
  images: string[];
  level: ExerciseLevel;
  force: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string;
  instructions: string[];
  /** Short "how to do it right" coaching cue — authored later; undefined for now. */
  formCue?: string;
};

export const EXERCISES: Exercise[] = [
  {
    "id": "Pushups",
    "name": "Pushups",
    "images": [
      "/exercises/Pushups/0.jpg",
      "/exercises/Pushups/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "category": "strength",
    "instructions": [
      "Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length.",
      "Next, lower yourself downward until your chest almost touches the floor as you inhale.",
      "Now breathe out and press your upper body back up to the starting position while squeezing your chest.",
      "After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."
    ]
  },
  {
    "id": "Incline_Push-Up",
    "name": "Incline Push-Up",
    "images": [
      "/exercises/Incline_Push-Up/0.jpg",
      "/exercises/Incline_Push-Up/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "category": "strength",
    "instructions": [
      "Stand facing bench or sturdy elevated platform. Place hands on edge of bench or platform, slightly wider than shoulder width.",
      "Position forefoot back from bench or platform with arms and body straight. Arms should be perpendicular to body. Keeping body straight, lower chest to edge of box or platform by bending arms.",
      "Push body up until arms are extended. Repeat."
    ]
  },
  {
    "id": "Incline_Push-Up_Medium",
    "name": "Incline Push-Up Medium",
    "images": [
      "/exercises/Incline_Push-Up_Medium/0.jpg",
      "/exercises/Incline_Push-Up_Medium/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "abdominals",
      "shoulders",
      "triceps"
    ],
    "category": "strength",
    "instructions": [
      "Stand facing a Smith machine bar or sturdy elevated platform at an appropriate height.",
      "Place your hands on the bar, with your hands about shoulder width apart.",
      "Position your feet back from the bar with arms and body straight. This will be your starting position.",
      "Keeping your body straight, lower your chest to the bar by bending the arms.",
      "Return to the starting position by extending the elbows, pressing yourself back up."
    ]
  },
  {
    "id": "Pushups_Close_and_Wide_Hand_Positions",
    "name": "Pushups (Close and Wide Hand Positions)",
    "images": [
      "/exercises/Pushups_Close_and_Wide_Hand_Positions/0.jpg",
      "/exercises/Pushups_Close_and_Wide_Hand_Positions/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "category": "strength",
    "instructions": [
      "Lie on the floor face down and body straight with your toes on the floor and the hands wider than shoulder width for a wide hand position and closer than shoulder width for a close hand position. Make sure you are holding your torso up at arms length.",
      "Lower yourself until your chest almost touches the floor as you inhale.",
      "Using your pectoral muscles, press your upper body back up to the starting position and squeeze your chest. Breathe out as you perform this step.",
      "After a second pause at the contracted position, repeat the movement for the prescribed amount of repetitions."
    ]
  },
  {
    "id": "Bench_Dips",
    "name": "Bench Dips",
    "images": [
      "/exercises/Bench_Dips/0.jpg",
      "/exercises/Bench_Dips/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "category": "strength",
    "instructions": [
      "For this exercise you will need to place a bench behind your back. With the bench perpendicular to your body, and while looking away from it, hold on to the bench on its edge with the hands fully extended, separated at shoulder width. The legs will be extended forward, bent at the waist and perpendicular to your torso. This will be your starting position.",
      "Slowly lower your body as you inhale by bending at the elbows until you lower yourself far enough to where there is an angle slightly smaller than 90 degrees between the upper arm and the forearm. Tip: Keep the elbows as close as possible throughout the movement. Forearms should always be pointing down.",
      "Using your triceps to bring your torso up again, lift yourself back to the starting position.",
      "Repeat for the recommended amount of repetitions."
    ]
  },
  {
    "id": "Bodyweight_Squat",
    "name": "Bodyweight Squat",
    "images": [
      "/exercises/Bodyweight_Squat/0.jpg",
      "/exercises/Bodyweight_Squat/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder width apart. You can place your hands behind your head. This will be your starting position.",
      "Begin the movement by flexing your knees and hips, sitting back with your hips.",
      "Continue down to full depth if you are able,and quickly reverse the motion until you return to the starting position. As you squat, keep your head and chest up and push your knees out."
    ]
  },
  {
    "id": "Freehand_Jump_Squat",
    "name": "Freehand Jump Squat",
    "images": [
      "/exercises/Freehand_Jump_Squat/0.jpg",
      "/exercises/Freehand_Jump_Squat/1.jpg"
    ],
    "level": "intermediate",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "calves",
      "glutes",
      "hamstrings"
    ],
    "category": "strength",
    "instructions": [
      "Cross your arms over your chest.",
      "With your head up and your back straight, position your feet at shoulder width.",
      "Keeping your back straight and chest up, squat down as you inhale until your upper thighs are parallel, or lower, to the floor.",
      "Now pressing mainly with the ball of your feet, jump straight up in the air as high as possible, using the thighs like springs. Exhale during this portion of the movement.",
      "When you touch the floor again, immediately squat down and jump again.",
      "Repeat for the recommended amount of repetitions."
    ]
  },
  {
    "id": "Bodyweight_Walking_Lunge",
    "name": "Bodyweight Walking Lunge",
    "images": [
      "/exercises/Bodyweight_Walking_Lunge/0.jpg",
      "/exercises/Bodyweight_Walking_Lunge/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": null,
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "calves",
      "glutes",
      "hamstrings"
    ],
    "category": "strength",
    "instructions": [
      "Begin standing with your feet shoulder width apart and your hands on your hips.",
      "Step forward with one leg, flexing the knees to drop your hips. Descend until your rear knee nearly touches the ground. Your posture should remain upright, and your front knee should stay above the front foot.",
      "Drive through the heel of your lead foot and extend both knees to raise yourself back up.",
      "Step forward with your rear foot, repeating the lunge on the opposite leg."
    ]
  },
  {
    "id": "Scissors_Jump",
    "name": "Scissors Jump",
    "images": [
      "/exercises/Scissors_Jump/0.jpg",
      "/exercises/Scissors_Jump/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "category": "plyometrics",
    "instructions": [
      "Assume a lunge stance position with one foot forward with the knee bent, and the rear knee nearly touching the ground.",
      "Ensure that the front knee is over the midline of the foot. Extending through both legs, jump as high as possible, swinging your arms to gain lift.",
      "As you jump as high as you can, switch the position of your legs, moving your front leg to the back and the rear leg to the front.",
      "As you land, absorb the impact through the legs by adopting the lunge position, and repeat."
    ]
  },
  {
    "id": "Double_Leg_Butt_Kick",
    "name": "Double Leg Butt Kick",
    "images": [
      "/exercises/Double_Leg_Butt_Kick/0.jpg",
      "/exercises/Double_Leg_Butt_Kick/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "abductors",
      "adductors",
      "calves",
      "glutes",
      "hamstrings"
    ],
    "category": "plyometrics",
    "instructions": [
      "Begin standing with your knees slightly bent.",
      "Quickly squat a short distance, flexing the hips and knees, and immediately extend to jump for maximum vertical height.",
      "As you go up, tuck your heels by flexing the knees, attempting to touch the buttocks.",
      "Finish the motion by landing with the knees only partially bent, using your legs to absorb the impact."
    ]
  },
  {
    "id": "Star_Jump",
    "name": "Star Jump",
    "images": [
      "/exercises/Star_Jump/0.jpg",
      "/exercises/Star_Jump/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "calves",
      "glutes",
      "hamstrings",
      "shoulders"
    ],
    "category": "plyometrics",
    "instructions": [
      "Begin in a relaxed stance with your feet shoulder width apart and hold your arms close to the body.",
      "To initiate the move, squat down halfway and explode back up as high as possible. Fully extend your entire body, spreading your legs and arms away from the body.",
      "As you land, bring your limbs back in and absorb your impact through the legs."
    ]
  },
  {
    "id": "Mountain_Climbers",
    "name": "Mountain Climbers",
    "images": [
      "/exercises/Mountain_Climbers/0.jpg",
      "/exercises/Mountain_Climbers/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "compound",
    "equipment": null,
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "chest",
      "hamstrings",
      "shoulders"
    ],
    "category": "plyometrics",
    "instructions": [
      "Begin in a pushup position, with your weight supported by your hands and toes. Flexing the knee and hip, bring one leg until the knee is approximately under the hip. This will be your starting position.",
      "Explosively reverse the positions of your legs, extending the bent leg until the leg is straight and supported by the toe, and bringing the other foot up with the hip and knee flexed. Repeat in an alternating fashion for 20-30 seconds."
    ]
  },
  {
    "id": "Rear_Leg_Raises",
    "name": "Rear Leg Raises",
    "images": [
      "/exercises/Rear_Leg_Raises/0.jpg",
      "/exercises/Rear_Leg_Raises/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": null,
    "equipment": "body only",
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [],
    "category": "stretching",
    "instructions": [
      "Place yourself on your hands knees on an exercise mat. Your head should be looking forward and the bend of the knees should create a 90-degree angle between the hamstrings and the calves. This will be your starting position.",
      "Extend one leg up and behind you. The knee and hip should both extend. Repeat for 5-10 repetitions, and then switch sides."
    ]
  },
  {
    "id": "Knee_Circles",
    "name": "Knee Circles",
    "images": [
      "/exercises/Knee_Circles/0.jpg",
      "/exercises/Knee_Circles/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [
      "hamstrings",
      "quadriceps"
    ],
    "category": "stretching",
    "instructions": [
      "Stand with your legs together and hands by your waist.",
      "Now move your knees in a circular motion as you breathe normally.",
      "Repeat for the recommended amount of repetitions."
    ]
  },
  {
    "id": "Kneeling_Arm_Drill",
    "name": "Kneeling Arm Drill",
    "images": [
      "/exercises/Kneeling_Arm_Drill/0.jpg",
      "/exercises/Kneeling_Arm_Drill/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": null,
    "equipment": null,
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "abdominals"
    ],
    "category": "plyometrics",
    "instructions": [
      "This drill helps increase arm efficiency during the run. Begin kneeling, left foot in front, right knee down. Apply pressure through the front heel to keep your glutes and hamstrings activated.",
      "Begin by blocking the arms in long, pendulum like swings. Close the arm angle, blocking with the arms as you would when jogging, progressing to a run and finally a sprint.",
      "As soon as your hands pass the hip, accelerate them forward during the sprinting motion to move them as quickly as possible.",
      "Switch knees and repeat."
    ]
  },
  {
    "id": "Superman",
    "name": "Superman",
    "images": [
      "/exercises/Superman/0.jpg",
      "/exercises/Superman/1.jpg"
    ],
    "level": "beginner",
    "force": "static",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "lower back"
    ],
    "secondaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "category": "stretching",
    "instructions": [
      "To begin, lie straight and face down on the floor or exercise mat. Your arms should be fully extended in front of you. This is the starting position.",
      "Simultaneously raise your arms, legs, and chest off of the floor and hold this contraction for 2 seconds. Tip: Squeeze your lower back to get the best results from this exercise. Remember to exhale during this movement. Note: When holding the contracted position, you should look like superman when he is flying.",
      "Slowly begin to lower your arms, legs and chest back down to the starting position while inhaling.",
      "Repeat for the recommended amount of repetitions prescribed in your program."
    ]
  },
  {
    "id": "Butt_Lift_Bridge",
    "name": "Butt Lift (Bridge)",
    "images": [
      "/exercises/Butt_Lift_Bridge/0.jpg",
      "/exercises/Butt_Lift_Bridge/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "isolation",
    "equipment": "body only",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "category": "strength",
    "instructions": [
      "Lie flat on the floor on your back with the hands by your side and your knees bent. Your feet should be placed around shoulder width. This will be your starting position.",
      "Pushing mainly with your heels, lift your hips off the floor while keeping your back straight. Breathe out as you perform this part of the motion and hold at the top for a second.",
      "Slowly go back to the starting position as you breathe in."
    ]
  },
  {
    "id": "Step-up_with_Knee_Raise",
    "name": "Step-up with Knee Raise",
    "images": [
      "/exercises/Step-up_with_Knee_Raise/0.jpg",
      "/exercises/Step-up_with_Knee_Raise/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings",
      "quadriceps"
    ],
    "category": "strength",
    "instructions": [
      "Stand facing a box or bench of an appropriate height with your feet together. This will be your starting position.",
      "Begin the movement by stepping up, putting your left foot on the top of the bench. Extend through the hip and knee of your front leg to stand up on the box. As you stand on the box with your left leg, flex your right knee and hip, bringing your knee as high as you can.",
      "Reverse this motion to step down off the box, and then repeat the sequence on the opposite leg."
    ]
  },
  {
    "id": "Plank",
    "name": "Plank",
    "images": [
      "/exercises/Plank/0.jpg",
      "/exercises/Plank/1.jpg"
    ],
    "level": "beginner",
    "force": "static",
    "mechanic": "isolation",
    "equipment": "body only",
    "primaryMuscles": [
      "abdominals"
    ],
    "secondaryMuscles": [],
    "category": "strength",
    "instructions": [
      "Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.",
      "Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."
    ]
  },
  {
    "id": "Side_Bridge",
    "name": "Side Bridge",
    "images": [
      "/exercises/Side_Bridge/0.jpg",
      "/exercises/Side_Bridge/1.jpg"
    ],
    "level": "beginner",
    "force": "static",
    "mechanic": null,
    "equipment": "body only",
    "primaryMuscles": [
      "abdominals"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "category": "strength",
    "instructions": []
  },
  {
    "id": "Dead_Bug",
    "name": "Dead Bug",
    "images": [
      "/exercises/Dead_Bug/0.jpg",
      "/exercises/Dead_Bug/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "abdominals"
    ],
    "secondaryMuscles": [],
    "category": "strength",
    "instructions": [
      "Begin lying on your back with your hands extended above you toward the ceiling.",
      "Bring your feet, knees, and hips up to 90 degrees.",
      "Exhale hard to bring your ribcage down and flatten your back onto the floor, rotating your pelvis up and squeezing your glutes. Hold this position throughout the movement. This will be your starting position.",
      "Initiate the exercise by extending one leg, straightening the knee and hip to bring the leg just above the ground.",
      "Maintain the position of your lumbar and pelvis as you perform the movement, as your back is going to want to arch.",
      "Stay tight and return the working leg to the starting position.",
      "Repeat on the opposite side, alternating until the set is complete."
    ]
  },
  {
    "id": "Cross-Body_Crunch",
    "name": "Cross-Body Crunch",
    "images": [
      "/exercises/Cross-Body_Crunch/0.jpg",
      "/exercises/Cross-Body_Crunch/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "abdominals"
    ],
    "secondaryMuscles": [],
    "category": "strength",
    "instructions": [
      "Lie flat on your back and bend your knees about 60 degrees.",
      "Keep your feet flat on the floor and place your hands loosely behind your head. This will be your starting position.",
      "Now curl up and bring your right elbow and shoulder across your body while bring your left knee in toward your left shoulder at the same time. Reach with your elbow and try to touch your knee. Exhale as you perform this movement. Tip: Try to bring your shoulder up towards your knee rather than just your elbow and remember that the key is to contract the abs as you perform the movement; not just to move the elbow.",
      "Now go back down to the starting position as you inhale and repeat with the left elbow and the right knee.",
      "Continue alternating in this manner until all prescribed repetitions are done."
    ]
  },
  {
    "id": "Crunches",
    "name": "Crunches",
    "images": [
      "/exercises/Crunches/0.jpg",
      "/exercises/Crunches/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "isolation",
    "equipment": "body only",
    "primaryMuscles": [
      "abdominals"
    ],
    "secondaryMuscles": [],
    "category": "strength",
    "instructions": [
      "Lie flat on your back with your feet flat on the ground, or resting on a bench with your knees bent at a 90 degree angle. If you are resting your feet on a bench, place them three to four inches apart and point your toes inward so they touch.",
      "Now place your hands lightly on either side of your head keeping your elbows in. Tip: Don't lock your fingers behind your head.",
      "While pushing the small of your back down in the floor to better isolate your abdominal muscles, begin to roll your shoulders off the floor.",
      "Continue to push down as hard as you can with your lower back as you contract your abdominals and exhale. Your shoulders should come up off the floor only about four inches, and your lower back should remain on the floor. At the top of the movement, contract your abdominals hard and keep the contraction for a second. Tip: Focus on slow, controlled movement - don't cheat yourself by using momentum.",
      "After the one second contraction, begin to come down slowly again to the starting position as you inhale.",
      "Repeat for the recommended amount of repetitions."
    ]
  },
  {
    "id": "Oblique_Crunches",
    "name": "Oblique Crunches",
    "images": [
      "/exercises/Oblique_Crunches/0.jpg",
      "/exercises/Oblique_Crunches/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "isolation",
    "equipment": "body only",
    "primaryMuscles": [
      "abdominals"
    ],
    "secondaryMuscles": [],
    "category": "strength",
    "instructions": [
      "Lie flat on the floor with your lower back pressed to the ground. For this exercise, you will need to put one hand beside your head and the other to the side against the floor.",
      "Make sure your feet are elevated and resting on a flat surface.",
      "Now lift the shoulder in which your hand is touching your head.",
      "Simply elevate your shoulder and body upward until you touch your knee. For example, if you have your right hand besides your head, then you want to elevate your body upwards until your right elbow touches your left knee. The same variation can be applied doing the inverse and using your left elbow to touch your right knee.",
      "After your knee touches your elbow, lower your body until you have reached the starting position.",
      "Remember to breathe in during the eccentric (lowering) part of the exercise and to breathe out during the concentric (upward) part of the exercise.",
      "Continue alternating in this manner until all of the recommended repetitions for each side have been completed."
    ]
  },
  {
    "id": "Russian_Twist",
    "name": "Russian Twist",
    "images": [
      "/exercises/Russian_Twist/0.jpg",
      "/exercises/Russian_Twist/1.jpg"
    ],
    "level": "intermediate",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "abdominals"
    ],
    "secondaryMuscles": [
      "lower back"
    ],
    "category": "strength",
    "instructions": [
      "Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the knees.",
      "Elevate your upper body so that it creates an imaginary V-shape with your thighs. Your arms should be fully extended in front of you perpendicular to your torso and with the hands clasped. This is the starting position.",
      "Twist your torso to the right side until your arms are parallel with the floor while breathing out.",
      "Hold the contraction for a second and move back to the starting position while breathing out. Now move to the opposite side performing the same techniques you applied to the right side.",
      "Repeat for the recommended amount of repetitions."
    ]
  },
  {
    "id": "Air_Bike",
    "name": "Air Bike",
    "images": [
      "/exercises/Air_Bike/0.jpg",
      "/exercises/Air_Bike/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "abdominals"
    ],
    "secondaryMuscles": [],
    "category": "strength",
    "instructions": [
      "Lie flat on the floor with your lower back pressed to the ground. For this exercise, you will need to put your hands beside your head. Be careful however to not strain with the neck as you perform it. Now lift your shoulders into the crunch position.",
      "Bring knees up to where they are perpendicular to the floor, with your lower legs parallel to the floor. This will be your starting position.",
      "Now simultaneously, slowly go through a cycle pedal motion kicking forward with the right leg and bringing in the knee of the left leg. Bring your right elbow close to your left knee by crunching to the side, as you breathe out.",
      "Go back to the initial position as you breathe in.",
      "Crunch to the opposite side as you cycle your legs and bring closer your left elbow to your right knee and exhale.",
      "Continue alternating in this manner until all of the recommended repetitions for each side have been completed."
    ]
  },
  {
    "id": "Flutter_Kicks",
    "name": "Flutter Kicks",
    "images": [
      "/exercises/Flutter_Kicks/0.jpg",
      "/exercises/Flutter_Kicks/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "category": "strength",
    "instructions": [
      "On a flat bench lie facedown with the hips on the edge of the bench, the legs straight with toes high off the floor and with the arms on top of the bench holding on to the front edge.",
      "Squeeze your glutes and hamstrings and straighten the legs until they are level with the hips. This will be your starting position.",
      "Start the movement by lifting the left leg higher than the right leg.",
      "Then lower the left leg as you lift the right leg.",
      "Continue alternating in this manner (as though you are doing a flutter kick in water) until you have done the recommended amount of repetitions for each leg. Make sure that you keep a controlled movement at all times. Tip: You will breathe normally as you perform this movement."
    ]
  },
  {
    "id": "Sit-Up",
    "name": "Sit-Up",
    "images": [
      "/exercises/Sit-Up/0.jpg",
      "/exercises/Sit-Up/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "isolation",
    "equipment": "body only",
    "primaryMuscles": [
      "abdominals"
    ],
    "secondaryMuscles": [],
    "category": "strength",
    "instructions": [
      "Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the knees.",
      "Place your hands behind your head and lock them together by clasping your fingers. This is the starting position.",
      "Elevate your upper body so that it creates an imaginary V-shape with your thighs. Breathe out when performing this part of the exercise.",
      "Once you feel the contraction for a second, lower your upper body back down to the starting position while inhaling.",
      "Repeat for the recommended amount of repetitions."
    ]
  },
  {
    "id": "Pullups",
    "name": "Pullups",
    "images": [
      "/exercises/Pullups/0.jpg",
      "/exercises/Pullups/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "middle back"
    ],
    "category": "strength",
    "instructions": [
      "Grab the pull-up bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance wider than your shoulder width. For a medium grip, your hands need to be spaced out at a distance equal to your shoulder width and for a close grip at a distance smaller than your shoulder width.",
      "As you have both arms extended in front of you holding the bar at the chosen grip width, bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out. This is your starting position.",
      "Pull your torso up until the bar touches your upper chest by drawing the shoulders and the upper arms down and back. Exhale as you perform this portion of the movement. Tip: Concentrate on squeezing the back muscles once you reach the full contracted position. The upper torso should remain stationary as it moves through space and only the arms should move. The forearms should do no other work other than hold the bar.",
      "After a second on the contracted position, start to inhale and slowly lower your torso back to the starting position when your arms are fully extended and the lats are fully stretched.",
      "Repeat this motion for the prescribed amount of repetitions."
    ]
  },
  {
    "id": "Chin-Up",
    "name": "Chin-Up",
    "images": [
      "/exercises/Chin-Up/0.jpg",
      "/exercises/Chin-Up/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "forearms",
      "middle back"
    ],
    "category": "strength",
    "instructions": [
      "Grab the pull-up bar with the palms facing your torso and a grip closer than the shoulder width.",
      "As you have both arms extended in front of you holding the bar at the chosen grip width, keep your torso as straight as possible while creating a curvature on your lower back and sticking your chest out. This is your starting position. Tip: Keeping the torso as straight as possible maximizes biceps stimulation while minimizing back involvement.",
      "As you breathe out, pull your torso up until your head is around the level of the pull-up bar. Concentrate on using the biceps muscles in order to perform the movement. Keep the elbows close to your body. Tip: The upper torso should remain stationary as it moves through space and only the arms should move. The forearms should do no other work other than hold the bar.",
      "After a second of squeezing the biceps in the contracted position, slowly lower your torso back to the starting position; when your arms are fully extended. Breathe in as you perform this portion of the movement.",
      "Repeat this motion for the prescribed amount of repetitions."
    ]
  },
  {
    "id": "V-Bar_Pullup",
    "name": "V-Bar Pullup",
    "images": [
      "/exercises/V-Bar_Pullup/0.jpg",
      "/exercises/V-Bar_Pullup/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "middle back",
      "shoulders"
    ],
    "category": "strength",
    "instructions": [
      "Start by placing the middle of the V-bar in the middle of the pull-up bar (assuming that the pull-up station you are using does not have neutral grip handles). The V-Bar handles will be facing down so that you can hang from the pull-up bar through the use of the handles.",
      "Once you securely place the V-bar, take a hold of the bar from each side and hang from it. Stick your chest out and lean yourself back slightly in order to better engage the lats. This will be your starting position.",
      "Using your lats, pull your torso up while leaning your head back slightly so that you do not hit yourself with the chin-up bar. Continue until your chest nearly touches the V-bar. Exhale as you execute this motion.",
      "After a second hold on the contracted position, slowly lower your body back to the starting position as you breathe in.",
      "Repeat for the prescribed number of repetitions."
    ]
  },
  {
    "id": "Wide-Grip_Rear_Pull-Up",
    "name": "Wide-Grip Rear Pull-Up",
    "images": [
      "/exercises/Wide-Grip_Rear_Pull-Up/0.jpg",
      "/exercises/Wide-Grip_Rear_Pull-Up/1.jpg"
    ],
    "level": "intermediate",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "middle back",
      "shoulders"
    ],
    "category": "strength",
    "instructions": [
      "Grab the pull-up bar with the palms facing forward using a wide grip.",
      "As you have both arms extended in front of you holding the bar, bring your torso forward and head so that there is an imaginary line from the pull-up bar to the back of your neck. This is your starting position.",
      "Pull your torso up until the bar is near the back of your neck. To do this, draw the shoulders and upper arms down and back while slightly leaning your head forward. Exhale as you perform this portion of the movement. Tip: Concentrate on squeezing the back muscles once you reach the full contracted position. The upper torso should remain stationary as it moves through space and only the arms should move. The forearms should do no other work other than hold the bar.",
      "After a second on the contracted position, start to inhale and slowly lower your torso back to the starting position when your arms are fully extended and the lats are fully stretched.",
      "Repeat this motion for the prescribed amount of repetitions."
    ]
  },
  {
    "id": "Seated_Biceps",
    "name": "Seated Biceps",
    "images": [
      "/exercises/Seated_Biceps/0.jpg",
      "/exercises/Seated_Biceps/1.jpg"
    ],
    "level": "expert",
    "force": "static",
    "mechanic": "isolation",
    "equipment": "body only",
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "category": "stretching",
    "instructions": [
      "Sit on the floor with your knees bent and your partner standing behind you. Extend your arms straight behind you with your palms facing each other. Your partner will hold your wrists for you. This will be the starting position.",
      "Attempt to flex your elbows, while your partner prevents any actual movement.",
      "After 10-20 seconds, relax your arms while your partner gently pulls your wrists up to stretch your biceps. Be sure to let your partner know when the stretch is appropriate to prevent injury or overstretching."
    ]
  },
  {
    "id": "Hyperextensions_With_No_Hyperextension_Bench",
    "name": "Hyperextensions With No Hyperextension Bench",
    "images": [
      "/exercises/Hyperextensions_With_No_Hyperextension_Bench/0.jpg",
      "/exercises/Hyperextensions_With_No_Hyperextension_Bench/1.jpg"
    ],
    "level": "intermediate",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "lower back"
    ],
    "secondaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "category": "strength",
    "instructions": [
      "With someone holding down your legs, slide yourself down to the edge a flat bench until your hips hang off the end of the bench. Tip: Your entire upper body should be hanging down towards the floor. Also, you will be in the same position as if you were on a hyperextension bench but the range of motion will be shorter due to the height of the flat bench vs. that of the hyperextension bench.",
      "With your body straight, cross your arms in front of you (my preference) or behind your head. This will be your starting position. Tip: You can also hold a weight plate for extra resistance in front of you under your crossed arms.",
      "Start bending forward slowly at the waist as far as you can while keeping your back flat. Inhale as you perform this movement. Keep moving forward until you almost touch the floor or you feel a nice stretch on the hamstrings (whichever comes first). Tip: Never round the back as you perform this exercise.",
      "Slowly raise your torso back to the initial position as you exhale. Tip: Avoid the temptation to arch your back past a straight line. Also, do not swing the torso at any time in order to protect the back from injury.",
      "Repeat for the recommended amount of repetitions."
    ]
  },
  {
    "id": "Natural_Glute_Ham_Raise",
    "name": "Natural Glute Ham Raise",
    "images": [
      "/exercises/Natural_Glute_Ham_Raise/0.jpg",
      "/exercises/Natural_Glute_Ham_Raise/1.jpg"
    ],
    "level": "intermediate",
    "force": "pull",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "calves",
      "glutes",
      "lower back"
    ],
    "category": "strength",
    "instructions": [
      "Using the leg pad of a lat pulldown machine or a preacher bench, position yourself so that your ankles are under the pads, knees on the seat, and you are facing away from the machine. You should be upright and maintaining good posture.",
      "This will be your starting position. Lower yourself under control until your knees are almost completely straight.",
      "Remaining in control, raise yourself back up to the starting position.",
      "If you are unable to complete a rep, use a band, a partner, or push off of a box to aid in completing a repetition."
    ]
  },
  {
    "id": "90_90_Hamstring",
    "name": "90/90 Hamstring",
    "images": [
      "/exercises/90_90_Hamstring/0.jpg",
      "/exercises/90_90_Hamstring/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": null,
    "equipment": "body only",
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "calves"
    ],
    "category": "stretching",
    "instructions": [
      "Lie on your back, with one leg extended straight out.",
      "With the other leg, bend the hip and knee to 90 degrees. You may brace your leg with your hands if necessary. This will be your starting position.",
      "Extend your leg straight into the air, pausing briefly at the top. Return the leg to the starting position.",
      "Repeat for 10-20 repetitions, and then switch to the other leg."
    ]
  },
  {
    "id": "Front_Leg_Raises",
    "name": "Front Leg Raises",
    "images": [
      "/exercises/Front_Leg_Raises/0.jpg",
      "/exercises/Front_Leg_Raises/1.jpg"
    ],
    "level": "beginner",
    "force": "pull",
    "mechanic": null,
    "equipment": "body only",
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [],
    "category": "stretching",
    "instructions": [
      "Stand next to a chair or other support, holding on with one hand.",
      "Swing your leg forward, keeping the leg straight. Continue with a downward swing, bringing the leg as far back as your flexibility allows. Repeat 5-10 times, and then switch legs."
    ]
  },
  {
    "id": "Inchworm",
    "name": "Inchworm",
    "images": [
      "/exercises/Inchworm/0.jpg",
      "/exercises/Inchworm/1.jpg"
    ],
    "level": "beginner",
    "force": null,
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [],
    "category": "stretching",
    "instructions": [
      "Stand with your feet close together. Keeping your legs straight, stretch down and put your hands on the floor directly in front of you. This will be your starting position.",
      "Begin by walking your hands forward slowly, alternating your left and your right. As you do so, bend only at the hip, keeping your legs straight.",
      "Keep going until your body is parallel to the ground in a pushup position.",
      "Now, keep your hands in place and slowly take short steps with your feet, moving only a few inches at a time.",
      "Continue walking until your feet are by hour hands, keeping your legs straight as you do so."
    ]
  },
  {
    "id": "Knee_Tuck_Jump",
    "name": "Knee Tuck Jump",
    "images": [
      "/exercises/Knee_Tuck_Jump/0.jpg",
      "/exercises/Knee_Tuck_Jump/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "abductors",
      "adductors",
      "calves",
      "glutes",
      "quadriceps"
    ],
    "category": "plyometrics",
    "instructions": [
      "Begin in a comfortable standing position with your knees slightly bent. Hold your hands in front of you, palms down with your fingertips together at chest height. This will be your starting position.",
      "Rapidly dip down into a quarter squat and immediately explode upward. Drive the knees towards the chest, attempting to touch them to the palms of the hands.",
      "Jump as high as you can, raising your knees up, and then ensure a good land be re-extending your legs, absorbing impact through be allowing the knees to rebend."
    ]
  },
  {
    "id": "Dips_-_Triceps_Version",
    "name": "Dips - Triceps Version",
    "images": [
      "/exercises/Dips_-_Triceps_Version/0.jpg",
      "/exercises/Dips_-_Triceps_Version/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "category": "strength",
    "instructions": [
      "To get into the starting position, hold your body at arm's length with your arms nearly locked above the bars.",
      "Now, inhale and slowly lower yourself downward. Your torso should remain upright and your elbows should stay close to your body. This helps to better focus on tricep involvement. Lower yourself until there is a 90 degree angle formed between the upper arm and forearm.",
      "Then, exhale and push your torso back up using your triceps to bring your body back to the starting position.",
      "Repeat the movement for the prescribed amount of repetitions."
    ]
  },
  {
    "id": "Body_Tricep_Press",
    "name": "Body Tricep Press",
    "images": [
      "/exercises/Body_Tricep_Press/0.jpg",
      "/exercises/Body_Tricep_Press/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "isolation",
    "equipment": "body only",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "category": "strength",
    "instructions": [
      "Position a bar in a rack at chest height.",
      "Standing, take a shoulder width grip on the bar and step a yard or two back, feet together and arms extended so that you are leaning on the bar. This will be your starting position.",
      "Begin by flexing the elbow, lowering yourself towards the bar.",
      "Pause, and then reverse the motion by extending the elbows.",
      "Progress from bodyweight by adding chains over your shoulders."
    ]
  },
  {
    "id": "Standing_Towel_Triceps_Extension",
    "name": "Standing Towel Triceps Extension",
    "images": [
      "/exercises/Standing_Towel_Triceps_Extension/0.jpg",
      "/exercises/Standing_Towel_Triceps_Extension/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "isolation",
    "equipment": "body only",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "category": "strength",
    "instructions": [
      "To begin, stand up with both arms fully extended above the head holding one end of a towel with both hands. Your elbows should be in and the arms perpendicular to the floor with the palms facing each other while your feet should be shoulder width apart from each other. This is the starting position.",
      "Now communicate with your partner so that he/she can grip the other side of the towel to apply resistance. Keeping your upper arms close to your head (elbows in) and perpendicular to the floor, lower the resistance in a semicircular motion behind your head until your forearms touch your biceps. Tip: The upper arms should remain stationary and only the forearms should move. Breathe in as you perform this step.",
      "Go back to the starting position by using the triceps to raise the towel. Breathe out as you perform this step.",
      "Repeat for the recommended amount of repetitions."
    ]
  },
  {
    "id": "Incline_Push-Up_Close-Grip",
    "name": "Incline Push-Up Close-Grip",
    "images": [
      "/exercises/Incline_Push-Up_Close-Grip/0.jpg",
      "/exercises/Incline_Push-Up_Close-Grip/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "category": "strength",
    "instructions": [
      "Stand facing a Smith machine bar or sturdy elevated platform at an appropriate height.",
      "Place your hands next to one another on the bar.",
      "Position your feet back from the bar with arms and body straight. This will be your starting position.",
      "Keeping your body straight, lower your chest to the bar by bending the arms.",
      "Return to the starting position by extending the elbows, pressing yourself back up."
    ]
  },
  {
    "id": "Push-Ups_-_Close_Triceps_Position",
    "name": "Push-Ups - Close Triceps Position",
    "images": [
      "/exercises/Push-Ups_-_Close_Triceps_Position/0.jpg",
      "/exercises/Push-Ups_-_Close_Triceps_Position/1.jpg"
    ],
    "level": "intermediate",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "category": "strength",
    "instructions": [
      "Lie on the floor face down and place your hands closer than shoulder width for a close hand position. Make sure that you are holding your torso up at arms' length.",
      "Lower yourself until your chest almost touches the floor as you inhale.",
      "Using your triceps and some of your pectoral muscles, press your upper body back up to the starting position and squeeze your chest. Breathe out as you perform this step.",
      "After a second pause at the contracted position, repeat the movement for the prescribed amount of repetitions."
    ]
  },
  {
    "id": "Handstand_Push-Ups",
    "name": "Handstand Push-Ups",
    "images": [
      "/exercises/Handstand_Push-Ups/0.jpg",
      "/exercises/Handstand_Push-Ups/1.jpg"
    ],
    "level": "expert",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "category": "strength",
    "instructions": [
      "With your back to the wall bend at the waist and place both hands on the floor at shoulder width.",
      "Kick yourself up against the wall with your arms straight. Your body should be upside down with the arms and legs fully extended. Keep your whole body as straight as possible. Tip: If doing this for the first time, have a spotter help you. Also, make sure that you keep facing the wall with your head, rather than looking down.",
      "Slowly lower yourself to the ground as you inhale until your head almost touches the floor. Tip: It is of utmost importance that you come down slow in order to avoid head injury.",
      "Push yourself back up slowly as you exhale until your elbows are nearly locked.",
      "Repeat for the recommended amount of repetitions."
    ]
  },
  {
    "id": "Single_Leg_Glute_Bridge",
    "name": "Single Leg Glute Bridge",
    "images": [
      "/exercises/Single_Leg_Glute_Bridge/0.jpg",
      "/exercises/Single_Leg_Glute_Bridge/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "isolation",
    "equipment": "body only",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "category": "strength",
    "instructions": [
      "Lay on the floor with your feet flat and knees bent.",
      "Raise one leg off of the ground, pulling the knee to your chest. This will be your starting position.",
      "Execute the movement by driving through the heel, extending your hip upward and raising your glutes off of the ground.",
      "Extend as far as possible, pause and then return to the starting position."
    ]
  },
  {
    "id": "Glute_Kickback",
    "name": "Glute Kickback",
    "images": [
      "/exercises/Glute_Kickback/0.jpg",
      "/exercises/Glute_Kickback/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "compound",
    "equipment": "body only",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "category": "strength",
    "instructions": [
      "Kneel on the floor or an exercise mat and bend at the waist with your arms extended in front of you (perpendicular to the torso) in order to get into a kneeling push-up position but with the arms spaced at shoulder width. Your head should be looking forward and the bend of the knees should create a 90-degree angle between the hamstrings and the calves. This will be your starting position.",
      "As you exhale, lift up your right leg until the hamstrings are in line with the back while maintaining the 90-degree angle bend. Contract the glutes throughout this movement and hold the contraction at the top for a second. Tip: At the end of the movement the upper leg should be parallel to the floor while the calf should be perpendicular to it.",
      "Go back to the initial position as you inhale and now repeat with the left leg.",
      "Continue to alternate legs until all of the recommended repetitions have been performed."
    ]
  },
  {
    "id": "Leg_Lift",
    "name": "Leg Lift",
    "images": [
      "/exercises/Leg_Lift/0.jpg",
      "/exercises/Leg_Lift/1.jpg"
    ],
    "level": "beginner",
    "force": "push",
    "mechanic": "isolation",
    "equipment": "body only",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "category": "strength",
    "instructions": [
      "While standing up straight with both feet next to each other at around shoulder width, grab a sturdy surface such as the sides of a squat rack or the top of a chair to brace yourself and keep balance.",
      "With or without an ankle weight, lift one leg behind you as if performing a leg curl but standing up while keeping the other leg straight. Breathe out as you perform this movement.",
      "Slowly bring the raised leg back to the floor as you breathe in.",
      "Repeat for the recommended amount of repetitions.",
      "Repeat the movement with the opposite leg."
    ]
  },
];

/** Fast id → Exercise lookup for the plan-composition layer and UI. */
export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e])
);

/** All valid exercise ids — used to validate that plans reference real movements. */
export const EXERCISE_IDS: ReadonlySet<string> = new Set(EXERCISES.map((e) => e.id));
