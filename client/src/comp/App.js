import React from 'react'; 
import SearchBar from './SearchBar'; 
import youtube from '../api/youtube';
import VideoList from './VideoList';
import VideoDetail from './VideoDetail';
import CommentDetail from './CommentDetail';
import socketIOClient from "socket.io-client";
import Message from './Message'; 
import MessageList from './MessageList';
import Login from './Login'; 
import './App.css';



class App extends React.Component {
    state = {videos: [], selectedVideo: null, data:null,  endpoint: "localhost:4001", color: 'white', messages:[],newTime:0, time:0, playerState:-1, target:[], id: Math.floor(Math.random() * 100000) };

    send = (list) => {
        const socket = socketIOClient(this.state.endpoint);
        //You are sendign the array of messages
        socket.emit('change color', list) 
      }

    // When a user makes a search query, it is emmited to the other sockets, then once it is recived again, it will be rendered
    EmitSearch = (result) =>{
       
        const socket = socketIOClient(this.state.endpoint);
        socket.emit('search', result) 


    }
      componentWillMount = () => {
          const socket = socketIOClient(this.state.endpoint);
          socket.on('change color', (col) => {
              // Here Im updating the messages array, to be the new messages that I have recived
              this.setState({messages:col});
          })

          // Setting the state with the search result
          socket.on('search', (result) => {
            
            this.setState({
                videos: result.data.items,
                selectedVideo:result.data.items[0]
              });   
        })

        socket.on('select', (video) => {
            
            this.setState({selectedVideo:video});

        })

        socket.on('play', (state) => {
            this.setState({playerState:state})
        })

        socket.on('newTime', (newTime) => {
            this.setState({newTime:newTime})
        })


      }

    sendMessage = (message) =>{
        
        // You take this message that is given, and update the state of the messages
        const list = this.state.messages;
        list.push(message); 
        this.send(list)

    }


    pressPlay = (state) => {

        const socket = socketIOClient(this.state.endpoint);
        socket.emit('play', state)


    }


    newTime = (newTime) => {

        const socket = socketIOClient(this.state.endpoint);
        socket.emit('newTime', newTime)


    }

 
    search = async (term)=>{
        //The SearchBar calls the search funciton with the term
        // And here we will make the api request

        const result = await youtube.get("/search", {
            params: {
              q: term,
              part: "snippet",
               type: 'video',
              maxResults: 5,
              key: 'AIzaSyBSAzBSy4bhfG8JaCmptEDdreLpQXdAAbQ'            }
          });
         
          this.EmitSearch(result);
          
    }


// This is a function
onVideoSelect = (video) =>{

    
    const socket = socketIOClient(this.state.endpoint);
    socket.emit('select', video) 
   
}

render(){

    if(true){


        // Here you need to have the login form, this is also where
        // will ask the perosn to join a room, or generate a code

        return(
            <div className="cont">
                <div className="ui segment" >
                <Login/>
                </div>
            </div>
        );

    }
    

    return(

        <div className="ui container" style ={{marginTop:'10px' }}>

            <SearchBar Search={this.search} />
            
            
            <div className="ui grid">
                <div className="ui row">

                    <div  className="eleven wide column">
                        
                        <VideoDetail  updatedTime={this.state.newTime} newTime ={this.newTime}id={this.state.id} time ={this.state.time} playerState={this.state.playerState} play={this.pressPlay} video={this.state.selectedVideo}/>
                        <h4 className="ui header"> Chat Room</h4>
                            
                                {this.state.data}
                            <div className="ui segment"> 
                            <MessageList msglist={this.state.messages}/>
                            
                            </div>
                            <Message msg={this.sendMessage} />



                    </div>

                    <div className="five wide column">

                        <VideoList videos={this.state.videos} onVideoSelect = {this.onVideoSelect}/>
                    </div>

                </div>
                
                 
                
            </div>
            <div className="ui fluid segment" >
            <Login/>
            </div>
    
         </div>
    );

}





}

export default App; 