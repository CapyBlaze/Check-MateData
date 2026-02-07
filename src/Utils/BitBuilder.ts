export class BitBuilder {
    private tmpBits: string;
    private bytes: number[];


    constructor() {
        this.tmpBits = '';
        this.bytes = [];
    }


    pushString(binaryString: string) {
        binaryString = this.tmpBits + binaryString;

        const chunks = binaryString.match(/.{1,8}/g);
        if (!chunks) return;

        if (chunks[chunks.length - 1].length < 8) {
            this.tmpBits = chunks.pop() || '';
        } else {
            this.tmpBits = '';
        }

        this.bytes.push(
            ...chunks.map(
                byte => parseInt(byte, 2)
            )
        );
    }

    getUint8Array(): Uint8Array {
        const finalBytes = [...this.bytes];

        if (this.tmpBits.length > 0) {
            finalBytes.push(
                parseInt(this.tmpBits.padEnd(8, '0'), 2)
            );
        }

        return new Uint8Array(finalBytes);
    }
}