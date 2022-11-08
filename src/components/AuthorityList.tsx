import ListGroup from 'react-bootstrap/ListGroup';
import {Keys} from '../interfaces/account.interface';

export default (keys: Keys) => (
    <ListGroup variant="flush">
        <ListGroup variant="flush">
            <ListGroup.Item>
                {
                    keys.owner.map((account) => (
                        <ListGroup.Item>account.key</ListGroup.Item>
                    ))
                }
            </ListGroup.Item>
        </ListGroup>
        <ListGroup variant="flush">
            <ListGroup.Item>
                {
                    keys.active.map((account) => (
                        <ListGroup.Item>account.key</ListGroup.Item>
                    ))
                }
            </ListGroup.Item>
        </ListGroup>
        <ListGroup variant="flush">
            <ListGroup.Item>
                {
                    keys.posting.map((account) => (
                        <ListGroup.Item>account.key</ListGroup.Item>
                    ))
                }
            </ListGroup.Item>
        </ListGroup>
    </ListGroup>

);