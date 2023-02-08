import { Route, Routes } from 'react-router-dom';
import LoginForm from '../account/LoginForm';
import { HomePage, SearchBar } from '../account/SearchPage';
import { TransactionPage } from '../account/TransactionsPage';
const Routing = () =>{
    return(
            <Routes>
                <Route path='/' element={ <SearchBar />}/>
                <Route path='/@:id' element={<HomePage  />}/>
                <Route path='/login' element={<LoginForm/>}/>
                <Route path='/transaction' element={<TransactionPage/>}/> 
            </Routes>
    )
}

export default Routing;