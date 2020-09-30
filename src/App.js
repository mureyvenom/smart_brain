import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';

// const app = new Clarifai.App({
//   apiKey: "90da5eb311ac48b5b2f45ecf04fc731d",
// });

const particlesParams = {
  particles: {
    particles: {
      number: {
        value: 90,
        density: {
          enable: true,
          value_are: 800
        }
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: "",
    email: '',
    entries: 0,
    joined: ''
  }
}
  
class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (user) => {
    this.setState({user: {
      id: user.id,
      name: user.name,
      email: user.email,
      entries: user.entries,
      joined: user.joined
    }})
  }

  calculateFaceLocation = (data) => {
    //console.log(data);
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputImage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFacebox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
      fetch('localhost:3001/imageUrl', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if(response){
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries:count}))
          })
          .catch(err => console.log(err))
        }
        this.displayFacebox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err))
    //   .then(
    //   response => {
    //     this.calculateFaceLocation(response)
    //   },
    //   err => {
    //     // there was an error
    //     console.log(err);
    //   }
    // );
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState);
    }else if(route === 'home'){
      this.setState({isSignedIn: true})
    }else if(route === 'signin'){
      this.setState({isSignedIn: false})
    }
    this.setState({route: route});
  }

  render(){
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles' params={particlesParams.particles} style={{width: '100%'}}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home' 
        ? 
        <div>
            <Logo />
            <Rank username={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onButtonSubmit={this.onButtonSubmit} onInputChange={this.onInputChange} />
            <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
        :(
          route === 'signin'
          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          ) 
         

        }
        
        
      </div>
    );
  }

}

export default App;
