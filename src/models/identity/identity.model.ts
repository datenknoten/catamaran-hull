/*!
 * @License MIT
 */

import {
    Column,
    Entity,
    PrimaryColumn,
} from 'typeorm';

import { IdentityImage } from './identity-image.model';
import { IdentityName } from './identity-name.model';

/**
 * Representation of an identity
 */
@Entity()
export class Identity {
    @PrimaryColumn()
    public id: string;

    @Column()
    public isSelf: boolean = false;

    public primaryName?: IdentityName;
    public names: IdentityName[] = [];

    public primaryImage?: IdentityImage;
    public images: IdentityImage[] = [];

    public constructor(id: string) {
        this.id = id;
    }
}
