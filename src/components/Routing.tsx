import {Routes, Route} from 'react-router-dom'
import Search from './SearchPage';
import LoginForm from './LoginForm';

const Routing = () =>{
    return(
        <div>
            <Routes>
                <Route path='/' element={ <Search.SearchBar />}/>
                <Route path='/@:id' element={<Search.SearchPage  />}/>
                <Route path='/login' element={<LoginForm/>}/>
            </Routes>
        </div>
    )
}

export default Routing;