import { Route, Routes } from 'react-router-dom';
import LoginForm from './LoginForm';
import Search from './SearchPage';
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