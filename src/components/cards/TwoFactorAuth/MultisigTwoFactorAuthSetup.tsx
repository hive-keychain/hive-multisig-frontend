import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useAppSelector } from '../../../redux/app/hooks';
import { AuthorityCard } from '../Account/AuthorityCard';

export const MultisigTwoFactorAuthSetup = () => {
  const active_authorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities.active,
  );

  const [thresholdIsOne, setThresholdIsOne] = useState<boolean>();
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  useEffect(() => {
    if (active_authorities) {
      if (active_authorities.weight_threshold > 1) {
        setThresholdIsOne(false);
      } else {
        setThresholdIsOne(true);
      }
    }
  }, [active_authorities]);

  const validActiveThreshold = (): boolean => {
    let totalWeight = 0;
    newAuthorities.active.account_auths.forEach((account) => {
      totalWeight += account[1];
    });
    newAuthorities.active.key_auths.forEach((key) => {
      totalWeight += key[1];
    });

    return totalWeight >= newAuthorities.active.weight_threshold;
  };

  const modifyAuthority = () => {};
  // condition 1: when threshold is 1
  // condition 2: when threshold is greater than 1
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="auto" lg="7">
          <Card border="secondary">
            <Container>
              <Card.Body>
                <h3 className="card-title text-center">Multisig 2FA Setup</h3>
                <p className="justify-content-md-center">
                  {' '}
                  To complete the Two Factor Authentication setup, it is
                  required to add @hive.multisig in your account authorities.
                </p>

                {thresholdIsOne ? (
                  <p className="justify-content-md-center">
                    With your current Active Authority settings, we suggest to
                    add @hive.multisig with weight of 1 and bump the weight
                    threshold to 2 as follows:
                  </p>
                ) : (
                  <p className="justify-content-md-center">
                    With your current Active Authority settings, we suggest to
                    add @hive.multisig with weight of 1 and bump the weight
                    threshold to 2 as follows:
                  </p>
                )}

                <AuthorityCard
                  key={'Active'}
                  authorityName={'Active'}
                  authority={active_authorities}
                />

                <p className="justify-content-md-center">
                  Please review the suggested modifications above. You may make
                  your own modification as you desire. Finally, press submit to
                  broadcast the changes.
                </p>
                <div className="d-flex justify-content-end">
                  <Button onClick={() => {}} className="" variant="success">
                    Setup Multisig
                  </Button>
                </div>
              </Card.Body>
            </Container>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
