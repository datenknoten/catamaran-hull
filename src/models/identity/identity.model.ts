import { IdentityName } from "./identity-name.model";
import { IdentityImage } from "./identity-image.model";

export class Identity {
    public id: string;
    public isSelf: boolean = false;

    public primaryName?: IdentityName;
    public names: IdentityName[] = [];

    public primaryImage?: IdentityImage;
    public images: IdentityImage[] = [];

    public constructor(id: string) {
        this.id = id;
    }
}
