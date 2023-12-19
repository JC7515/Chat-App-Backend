## Welcome To MovieZone Backend 🍿

## Introduction

MovieZone is a sample project that provides subscription-based streaming services and allows playback of movies and TV series.

## Tech Stack

**Server:** Node, Express, AWS, Postgresql, Nginx, Docker, DockerCompose

## Main Features

- Provide information and videos of movies and series
- Save customer favorites, likes and dislikes
- Authenticate and authorize users
- Process subscription change payments
- Manage password change


## Installation

- Navigate to the folder that will contain the project.
- Open Command Terminal:
   - Clone this repository: git clone https://github.com/JC7515/MovieZone-App-Backend.git 
   - Enter the backend directory: cd backend 
   - Install the dependencies: npm install
    
## Run Proyect In Development

To Development this project run

```bash
  npm run dev-start 
```

## Deployment Backend

To deploy this project run

```bash
  npm run build 
  npm run start 
```

## Uso

- Get the 4 trending series and movies (used only for the home page in the frontend): GET /v1/trendingAudiovisualMedia

```

  const url = `{localhost}/v1/trendingAudiovisualMedia`
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`,
    }
  })
  
  const data = await resp.json()

```

- You will get the 10 best series or movies or both at the same time of each genre by number of likes (the only three types of page in which this data will be used are passed as parameters, which are series, movies, home, if the parameter is home, the api will return a combination of movie and series, if it is movies only movies, if it is series only series): GET /v1/recommendedAudiovisualMedia/:page

```

  const page = 'home'||'series'||'movies'  
  
  const url = `{localhost}/v1/recommendedAudiovisualMedia/${page}`
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`,
    }
  })
  
  const data = await resp.json()

```

- You will get a group of all the series or movies or both at the same time, depending on the value of the page parameter, if the parameter value is 'series', the api will return all the series from the db without any filter, if the value is ' movies' will return all the movies in the db without any filter, if the value is 'home' the api will return a combination of all the series and movies without filter: GET /v1/allAudiovisualMedia/:page

```

  const page = 'home'||'series'||'movies'  
  
  const url = `{localhost}/v1/allAudiovisualMedia/${page}`
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`,
    }
  })
  
  const data = await resp.json()

```

- It will obtain the group of all movies or series saved as favorites by the user, depending on the value of the page parameter, if the value of the parameter is 'series' the api will return only the group of series favorites by the user, if the value is 'movies' 'the api will return the user's favorite movies and if it is 'home' a combination of both will be returned (it is mandatory to declare the user's id in the user_id parameter): GET /v1/favorites/:user_id?page={page}

```
  const page = 'home'||'series'||'movies'   

  const url = `${localhost}/v1/likes/${userId}?page=${page}`
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`,
    }
  })

  const data = await resp.json()

```

- Add a new series or movie to the user's favorites list (the value of the media_type property of the payload can only be 'movies' or 'series', since the value of media_type will filter if the content goes to the table of favorite series or favorite movies) : POST /v1/favorites

```
  const payload = {
    "user_id": userId,
    "content_id": idOfSerie || idOfMovie,
    "media_type": 'movies' || 'series', 
  }
    
  const resp = await fetch(`{localhost}/v1/favorites`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers:{
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    }
  }) 

```

- Delete a series or movie from the user's favorites list (the value of the payload's media_type property can only be 'movies' or 'series', since the value of media_type will filter if the content is deleted from the table of favorite series or favorite movies) : DELETE /v1/favorites?user_id=${user_id}&content_id=${content_id}&media_type=${media_type}

```
  const media_type = 'movies' || 'series'
  const content_id = idOfSerie || idOfMovie
  const user_id = userId


  const url = `{localhost}/v1/favorites?user_id=${user_id}&content_id=${content_id}&media_type=${media_type}`

  const resp = await fetch(url, {
    method: 'DELETE',
    headers:{
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    }
  }) 

  const data = await resp.json()

```


- It will obtain the group of all movies or series saved as disliked by the user, depending on the value of the page parameter, if the value of the parameter is 'series' the api will return only the group of series that the user does not like, if the value is 'movies' the api will return only the group of movies that the user does not like and if it is 'home' a combination of both will be returned (it is mandatory to declare the user id in the user_id parameter): GET /v1/dislikes/: user_id?page={page}

```
  const page = 'home'||'series'||'movies'  
     
  const url = `{localhost}/v1/dislikes/:user_id?page={page}`

  const resp = await fetch(url, {
    method: 'GET',
    headers:{
      'authorization': `Bearer ${token}`,
    }
  }) 

  const data = await resp.json()

```


- Add a new series or movie to the user's dislike list (the value of the media_type property of the payload can only be 'movies' or 'series', since the value of media_type will filter if the content goes to the table of series or movies that the user does not like): POST /v1/dislikes

```
  const payload = {
    "user_id": userId,
    "content_id": idOfSerie || idOfMovie,
    "media_type": 'movies' || 'series', 
  }
    
  const resp = await fetch(`{localhost}/v1/dislikes`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers:{
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    }
  }) 

```

********

- Delete a series or movie from the user's dislike list (the value of the media_type property of the payload can only be 'movies' or 'series', since the value of media_type will be filtered if the content is deleted from the table of series or movies that the user does not like): DELETE /v1/dislikes?user_id=${user_id}&content_id=${content_id}&media_type=${media_type}

```
  const media_type = 'movies' || 'series'
  const content_id = idOfSerie || idOfMovie
  const user_id = userId


  const url = `{localhost}/v1/dislikes?user_id=${user_id}&content_id=${content_id}&media_type=${media_type}`

  const resp = await fetch(url, {
    method: 'DELETE',
    headers:{
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    }
  }) 

  const data = await resp.json()

```




- It will obtain the group of all movies or series saved as liked by the user, depending on the value of the page parameter, if the value of the parameter is 'series' the api will return only the group of series that the user likes, if the value is ' movies' the api will return only the group of movies that the user likes and if it is 'home' a combination of both will be returned (it is mandatory to declare the user's id in the user_id parameter): GET /v1/likes/:user_id? page={page}

```
  const page = 'home'||'series'||'movies'  
     
  const url = `{localhost}/v1/likes/:user_id?page={page}`

  const resp = await fetch(url, {
    method: 'GET',
    headers:{
      'authorization': `Bearer ${token}`,
    }
  }) 

  const data = await resp.json()

```
  

- Add a new series or movie to the user's likes list (the value of the media_type property of the payload can only be 'movies' or 'series', since the value of media_type will filter if the content goes to the table of series or movies that the user likes): POST /v1/likes

```
  const payload = {
    "user_id": userId,
    "content_id": idOfSerie || idOfMovie,
    "media_type": 'movies' || 'series', 
  }
    
  const resp = await fetch(`{localhost}/v1/likes`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers:{
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    }
  }) 

```



- Delete a series or movie from the user's likes list (the value of the media_type property of the payload can only be 'movies' or 'series', since the value of media_type will filter if the content is deleted from the table of series or movies that the user likes): DELETE /v1/likes?user_id=${user_id}&content_id=${content_id}&media_type=${media_type}

```
  const media_type = 'movies' || 'series'
  const content_id = idOfSerie || idOfMovie
  const user_id = userId


  const url = `{localhost}/v1/likes?user_id=${user_id}&content_id=${content_id}&media_type=${media_type}`

  const resp = await fetch(url, {
    method: 'DELETE',
    headers:{
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    }
  }) 

  const data = await resp.json()

```


- Log in as user: POST /v1/login

```
    const payload = {
      email: 'email',
      password: 'password
    }

    const url = `{localhost}/v1/login`

    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const data = await resp.json()

```


- Log in as administrator: POST /v1/adminLogin

```
    const payload = {
      user_name: 'userName',
      password: 'password
    }

    const url = `{localhost}/v1/adminLogin`

    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const data = await resp.json()

```


- You will get the entire list of available subscriptions: GET /v1/subscription


```

  const url = `{localhost}/v1/suscription`
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    }
  })

  const data = await resp.json()

```


- It will create a payment session for the selected subscription type: POST /v1/checkoutSession

```
  const payload = {
    price_id: priceId,
    membership_name: 'membershipName',
    user_id: userId,
    price_currency: priceCurrencyOfMenbership
  }


  const url = '{localhost}/v1/checkoutSession'

  const resp = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    }
  })

  const data = await resp.json()

```


- The membership type of the user's account will be updated once the payment is validated (It is mandatory to provide the ID of the user for whom you wish to validate the payment): PUT /v1/validatePaymentStatus/:userId

```
  const url = `{localhost}/v1/validatePaymentStatus/${userId}`

  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      'authorization': `Bearer ${token}`,
    }
  })

  const data = await resp.json()

```


- It will obtain the video of the name of the movie that is passed through the movie_title parameter: GET /v1/movieVideo /:movie_title

```

  const url = `{localhost}/v1/movieVideo/${movie_title}`
      
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`,
    }
  })
  
  const data = await resp.json()

```


- You will get all the information about the chapters of the series name that is passed through the serie_title parameter: GET /v1/serieChapters/:serie_title

```
  const url = `{localhost}/v1/serieChapters/{serie_title}`
    
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`,
    }
  })

  const data = await resp.json()

```


- You will get all the information and the video of the chapter of the series name, the chosen season and the chapter number provided in the query parameters: GET /v1/chapterVideo?serie_title=${title}&season_number=${season}&chapter_number= ${chapter}

```
  const url = `{localhost}/v1/chapterVideo?serie_title=${title}&season_number=${season}&chapter_number=${chapter}`
 
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`,
    }
  })
  
  const data = await resp.json()

```


- It will update the user's password: PUT /v1/password

```

  const payload = {
    id: userId,
    password: 'newPassword'
  }

  const url = `{localhost}/v1/password`

  const resp = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    }
  })

  const data = await resp.json()


```


- It will update the Administrator password: PUT /v1/password

```

  const payload = {
    id: adminId,
    password: 'newPassword'
  }

  const url = `{localhost}/v1/adminPassword`

  const resp = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    }
  })


  const data = await resp.json()

```


- It will update the profile photo of the user's account: PUT /v1/updateProfilePicture/:id'

```
  const url = `{localhost}/v1/updateProfilePicture/${userId}`

  const resp = await fetch(url, {
      method: 'PUT',
      body: formData,
      headers: {
          'authorization': `Bearer ${token}`,
      }
  })

  const data = await resp.json()

```


- It will obtain the user information through the authorization token (this route requires the authorization token to obtain the user ID): GET /v1/userData

```
  const url = `{localhost}/v1/userData`

  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`,
    }
  })
    

  const data = await resp.json()

```



- You will obtain the administrator information through the administrator authorization token (this route requires the administrator authorization token to obtain the administrator id): GET /v1/adminData
​
```
  const url = `{localhost}/v1/adminData`

  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${adminToken}`,
    }
  })
    

  const data = await resp.json()

```

- A new user will be registered: POST /v1/signUp

```
    const payload = {
      id: generate_UUID,
      name: 'name_of_user',
      email: 'email',
      date: birthdate,
      password: 'password',
      create_at: new Date()
    }

    const url = `{localhost}/v1/signUp`
    
    const resp = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type' : 'application/json'
      }
    })

    const data = await resp.json()

```

## Autor
- JUAN7515