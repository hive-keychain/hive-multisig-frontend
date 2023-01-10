import { ReactNode, useEffect, useState } from 'react';
import { Stack } from 'react-bootstrap';
import { Authorities } from '../interfaces';
import { SearchAuthorityCard } from './cards/Search/SearchAuthorityCard';

interface ISearchAccountPageProp {
    authorities: Authorities;
  }
function SearchAccountPage({ authorities }: ISearchAccountPageProp) {
  const authNames = ['Owner','Active','Posting'] 
  const [display, setDisplay] = useState(false);
  const [cards, setCards] = useState<ReactNode[]>(
    authorities?
    [<SearchAuthorityCard 
        key={'Owner'}
        authorityName={'Owner'} 
        authority={authorities.owner} 
        />,
    <SearchAuthorityCard
        key={'Active'}
        authorityName={'Active'}
        authority={authorities.active}
        />,
    <SearchAuthorityCard
        key={'Posting'}
        authorityName={'Posting'}
        authority={authorities.posting}
        />]:[]
  )
    useEffect(()=>{
        console.log(cards)
    },[cards])
  useEffect(() =>{
    if (authorities) {
      console.log("authorities",authorities)
        let newCards:ReactNode[] = []
        newCards =authNames.map(
            (auth) =>{
                switch(auth){
                    case 'Owner':
                        return  <SearchAuthorityCard 
                        key={auth}
                        authorityName={auth} 
                        authority={authorities.owner} 
                        />
                    case 'Active':
                        return <SearchAuthorityCard 
                        key={auth}
                        authorityName={auth} 
                        authority={authorities.active} 
                        />
                    case 'Posting':
                        return <SearchAuthorityCard 
                        key={auth}
                        authorityName={auth} 
                        authority={authorities.posting} 
                        />
                }
            })
        setCards([...newCards])
        setDisplay(true);
    }else{
      setDisplay(false);
    }
  },[authorities])
  
  return (
    display?
    (<div>
      <Stack gap={3}>
        {cards}
      </Stack>
    </div>)
    :<div></div>
  )
}

export default SearchAccountPage
