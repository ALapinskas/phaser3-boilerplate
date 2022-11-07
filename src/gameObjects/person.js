class SelectableText {
    constructor(isCorrect, text) {
        /**
         * @type {boolean}
         * @private
         */
        this._isCorrect = isCorrect;
        /**
         * @type {String}
         * @private
         */
        this._text = text;
        /**
         * @type {boolean}
         * @private
         */
        this._isSelected = false;
    }
    
    get text() {
        return this._text;
    }

    get isCorrect() {
        return this._isCorrect;
    }

    get isSelected() {
        return this._isSelected;
    }

    setAsSelected() {
        this._isSelected = true;
    }
}

class Dialog {
    constructor(npc, user, active) {
        /**
         * @type {String | SelectableText[]}
         * @private
         */
        this._npc = npc;
        /**
         * @type {(String | SelectableText[])=}
         * @private
         */
        this._user = user;
        /**
         * @type {boolean=}
         * @private
         */
        this._active = typeof active === "boolean" ? active : false;
    }

    get npc() {
        return this._npc;
    }

    get user() {
        return this._user;
    }

    get active() {
        return this._active;
    }

    /**
     * @param {boolean} isActive
     */
    set active(isActive) {
        this._active = isActive;
    }
}

class DialogInjectable extends Dialog {
    constructor(npc, user, input_text, active) {
        super(npc, user, active);
        /**
         * @type {String=}
         * @private
         */
        this._input_text = input_text ? input_text : "Input text";
    }

    get input_text () {
        return this._input_text;
    }
}

class DialogSelectable extends Dialog {
    /**
     * 
     * @param {SelectableText[]} npc 
     * @param {SelectableText[]} user 
     * @param {boolean=} active
     */
    constructor(npc, user, active) {
        super(npc, user, active);
    }

    /**
     * 
     * @param {number} index 
     */
    setSelectedDialog(index) {
        this.npc[index].setAsSelected();
        this.user[index].setAsSelected();
    }
}

class Person extends Phaser.Physics.Matter.Sprite {
    constructor(world, x, y, texture, frame, options){
        super(world, x, y, texture, frame, options);
        /**
         * @type {Array[Dialog | DialogSelectable | DialogInjectable]}
         * @private
         */
        this._dialogs = [];
    }

    /**
     * 
     * @param {Array[Dialog | DialogSelectable | DialogInjectable]} dialogs 
     */
    setDialogs(dialogs) {
        this._dialogs = dialogs;
    }

    /**
     * @return {Array[Dialog | DialogSelectable | DialogInjectable]}
     */
    getDialogs() {
        return this._dialogs;
    }

    /**
     * @return {Dialog | DialogSelectable | DialogInjectable}
     */
    getActiveDialog() {
        return this._dialogs.find(item => item.active === true);
    }

    /**
     * 
     * @param {number=} index
     */
    switchActiveDialog(index) {
        const activeIndexDialog = this._dialogs.findIndex(item => item.active === true),
            dialogsLength = this.dialogs.length,
            isLastItemActive = activeIndexDialog === dialogsLength;
        if (typeof index === "number" ) {
            this._dialogs[activeIndexDialog].active = false;
            this._dialogs[index].active = true;
        } else if (!isLastItemActive) {
            this._dialogs[activeIndexDialog].active = false;
            this._dialogs[activeIndexDialog + 1].active = true;
        } 
    }
}

export { Person, SelectableText, Dialog, DialogInjectable, DialogSelectable };