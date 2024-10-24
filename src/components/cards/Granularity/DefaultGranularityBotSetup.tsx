import { GBotTabProp } from '../../../interfaces/granularity.interface';
import { useAppSelector } from '../../../redux/app/hooks';
import { AuthorityCard } from '../Account/AuthorityCard';
const defaultBot = process.env.GRANULARITY_BOT;

export const DefaultGranularityBotSetup = ({
  isManageGranularity,
}: GBotTabProp) => {
  const hasPostingDefaultGBot = useAppSelector(
    (state) => state.granularity.granularity.postingHasExistingGBot,
  );
  const hasActiveDefaultGBot = useAppSelector(
    (state) => state.granularity.granularity.activeHasExistingGBot,
  );
  return (
    <div>
      {isManageGranularity ? (
        <p className="justify-content-md-center">
          Removing the default bot <strong>@{`${defaultBot}`}</strong> will
          automatically reduce the threshold by its weight.
        </p>
      ) : (
        <div className="mb-2">
          <p className="justify-content-md-center">
            Threshold must be at least equal to 2 for the granularity bot to
            work properly.
          </p>
        </div>
      )}
      <div>
        {hasActiveDefaultGBot ? (
          <div>
            <strong>{`@${defaultBot}`}</strong>
            {' is already added in your active authorities.'}
          </div>
        ) : (
          <div>
            The granularity bot
            <strong>{` @${defaultBot}`}</strong>
            {` will be added to your active authorities and the weight threshold will be increased by 1.`}
          </div>
        )}
        <AuthorityCard authorityName="Active" />
        <br />
        {hasPostingDefaultGBot ? (
          <div>
            <strong>{`@${defaultBot}`}</strong>
            {' is already in your posting authorities.'}
          </div>
        ) : (
          <div>
            The granularity bot
            <strong>{` @${defaultBot}`}</strong>
            {` will be added to your posting authorities and the weight threshold will be increased by 1.`}
          </div>
        )}
        <AuthorityCard authorityName="Posting" />
      </div>
    </div>
  );
};
