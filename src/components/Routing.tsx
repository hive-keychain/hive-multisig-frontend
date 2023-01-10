import { Route, Routes } from 'react-router-dom';
import LoginForm from './LoginForm';
import { HomePage, SearchBar } from './SearchPage';
const Routing = () =>{
    return(
        <div>
            <Routes>
                <Route path='/' element={ <SearchBar />}/>
                <Route path='/@:id' element={<HomePage  />}/>
                <Route path='/login' element={<LoginForm/>}/>
            </Routes>
        </div>
    )
}

export default Routing;