import {Routes, Route} from 'react-router-dom'
import Search from './SearchPage';
const Routing = () =>{
    return(
        <div>
            <Routes>
                <Route path='/' element={ <Search.SearchBar />}/>
                <Route path='/@:id' element={<Search.SearchPage  />}/>
            </Routes>
        </div>
    )
}

export default Routing;