import { LightningElement,api } from 'lwc';
export default class ActionComponent extends LightningElement {
    @api value;

    connectedCallback() {
       
    }

    removeRow(event){
        let data={index: this.value,name: event.target.title};
        const selectEvent = new CustomEvent('remove', {
            detail: data ,bubbles: true, composed: true
        });
         console.log(JSON.stringify(data)+'  data');
        console.log(JSON.stringify(selectEvent));
        this.dispatchEvent(selectEvent);
    }
}