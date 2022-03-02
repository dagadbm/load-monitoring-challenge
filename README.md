# Setup

Recommended node version: 16.14.0

Install dependencies
`npm i --prefix back-end`
`npm i --prefix front-end`

Run each project in a separate terminal or appeend an `&` at the end of each command
`npm run start --prefix front-end`
`npm run start --prefix back-end`

# Architecture
## Folder Structure

I have decided to completely separate the front-end from the back-end.
This allows for better separation in terms of teams and tech stack in the future. (Assuming the API doesnt change ofc).

## API

I decided to create a separate metrics API endpoint on the back-end which can
pave the way for more different metrics if need be.

The API is currently very simple with just the cpu load average formula given
in the problem description.

I have decided that the measurements timestamp should also come from the server
since this gives a more accurate representation of when exactly the measurement
happened.

## Store

The main chunk of the logic lives in the store.
I decided to let the store handle the pooling with a separate action
giving also the ability to stop the pooling.

The main alerting logic is also done on the store per each request.
I would have liked to have some more separation here to be honest.
The code can be a bit more complex to reasonn about because there are a lot of different states that the store can be in per each cpu request.

# Improvements

## Notifications
The notifications UX are not what I would use in production.
I would probably use a pop-up modal instead or have a dedicated section to it.
I just wanted to show that I know you need to ask for permissions in terms of notifications (firefox for example no longer allows you to just ask for permissions unless its a response to a user action).

## UI/UX and mobile support
This one is self explanatory.
I am not a very good designer. I can more easily iterate design wise based on
some wireframes than doing something from scratch.
I also would have liked to add mobile support which is also linked with above.

## CPU Load Average
This is a new field fo me and I merely used the provided solution.
I searched for a lot of alternatives on gitub/gist/stackoverflow but I still don't understand what all the values mean and how to exactly get the proper avg %.
