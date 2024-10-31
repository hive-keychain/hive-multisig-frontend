import { KeychainKeyTypes } from 'hive-keychain-commons';
import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useAppSelector } from '../../../../redux/app/hooks';

interface IRemoveGBotModalProp {
  show: boolean;
  handleCancel: Function;
  handleSubmit: Function;
}
export const RemoveGranularityModal = ({
  show,
  handleCancel,
  handleSubmit,
}: IRemoveGBotModalProp) => {
  const granularityBots = useAppSelector(
    (state) => state.granularity.granularity.bots,
  );
  const [postingBots, setPostingBots] = useState<
    {
      botName: string;
      type: string;
      keyType: string;
    }[]
  >([]);
  const [activeBots, setActiveBots] = useState<
    {
      botName: string;
      type: string;
      keyType: string;
    }[]
  >([]);

  useEffect(() => {
    console.log({ granularityBots });
    if (granularityBots) {
      const posting = granularityBots.filter(
        (bot) =>
          bot.keyType.toLowerCase() === KeychainKeyTypes.posting.toLowerCase(),
      );

      const active = granularityBots.filter(
        (bot) =>
          bot.keyType.toLowerCase() === KeychainKeyTypes.active.toLowerCase(),
      );
      console.log(posting);
      console.log(active);
      setPostingBots(posting);
      setActiveBots(active);
    }
  }, [granularityBots]);

  useEffect(() => {
    console.log({ granularityBots });
  }, []);
  return (
    <Modal show={show} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Removing Granularity</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          You are about to remove the following granularity bot and all the
          granularity configuration.{' '}
        </p>

        {activeBots && activeBots.length > 0 ? (
          <div>
            <h3>Active</h3>
            {activeBots.map((bot) => {
              return <strong>@{bot.botName}</strong>;
            })}
          </div>
        ) : (
          ''
        )}
        <br />
        {postingBots && postingBots.length > 0 ? (
          <div>
            <h3>Posting</h3>
            {postingBots.map((bot) => {
              return <strong>@{bot.botName}</strong>;
            })}
          </div>
        ) : (
          ''
        )}

        <br />

        <p>Are you sure you want to remove?</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleCancel()}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => handleSubmit()}>
          Remove
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
