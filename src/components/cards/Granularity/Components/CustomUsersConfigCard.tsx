import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useAppSelector } from '../../../../redux/app/hooks';
import { GranularityUtils } from '../../../../utils/granularity-utils';
import { MultisigGranularityHooks } from '../GranularitySetupHooks';
import { AuthoritySelection } from './AuthoritySelection';
import { GranularityAuthorityCard } from './GranularityAuthorityCard';
interface ICustomUsersConfigCard {
  isConfirmation?: boolean;
}
export const CustomUsersConfigCard = ({
  isConfirmation,
}: ICustomUsersConfigCard) => {
  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();
  const [authorityCards, setAuthorityCards] = useState([]);
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);

  useEffect(() => {
    if (newConfiguration) {
      const authorities =
        GranularityUtils.getAuthorityNameList(newConfiguration);
      const cards = authorities.map((authority, index) => {
        return (
          <GranularityAuthorityCard
            authority={authority}
            isConfirmation={isConfirmation}
            key={authority}
          />
        );
      });

      setAuthorityCards(cards);
    }
  }, [newConfiguration]);
  return (
    <div className="mx-3 mb-3">
      {isConfirmation ? '' : <AuthoritySelection />}
      <Card className="flex-grow-1 mt-2">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>Authorities</div>
        </Card.Header>
        <Card.Body className="card-scroll" id="card-body">
          {authorityCards && authorityCards.length > 0 ? (
            authorityCards
          ) : (
            <div className="text-center text-muted">Add Authority</div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
