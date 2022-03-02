# Setup

Recommended node version: 16.14.0

Install dependencies
`npm i --prefix back-end`
`npm i --prefix front-end`

Run each project in a separate terminal or append an `&` at the end of each command
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
The code can be a bit more complex to reason about because there are different states that the store can be in per each cpu request.

## Components

I decided to use a mixture of scss and modules to get the best of both worlds.
I am not sure if this is what everyone uses now a days but I think it created a nice separation, even though styled components would probably be better.
I decided to use very basic css (e.g. no frameworks) on purpose. I also decided to be as semantic as I could in terms of HTML.

## Tests

I tried to make the tests as more integration as I could without mocking anything.
The exception is of course ChartJS.
Although the code coverage is not too high, and not everything was tested.
I think the most important features were tested.
