function PreferencesAssistant() { };

PreferencesAssistant.prototype.setup = function() {
    this.cookied_tuentiemail = new Mojo.Model.Cookie('tuentiemail');
    this.cookied_password = new Mojo.Model.Cookie('password');
    
    this.controller.setupWidget(Mojo.Menu.appMenu,
        this.attributes = {
            omitDefaultItems: true
        }
     );
    
    this.controller.setupWidget('tuentiemail', {
            textReplacement: false,
            modelProperty: "text",
            textCase: Mojo.Widget.steModeLowerCase
        });
    this.controller.setupWidget('password',
            this.model = { value: "" }
        );

    
    this.controller.setupWidget("save",
         this.attributes = {
             },
         this.model = {
             label : "Salvar",
             disabled: false
         }
     );
    
    Mojo.Event.listen(this.controller.get("save"), Mojo.Event.tap, this.handleUpdate.bind(this));
    
    this.object = this;
};

PreferencesAssistant.prototype.activate = function(event) {
    this.controller.get("tuentiemail").mojo.setValue(this.cookied_tuentiemail.get());
    this.controller.get("password").mojo.setValue(this.cookied_password.get());
};

PreferencesAssistant.prototype.handleUpdate = function(event) {
    this.first_time = true;
    this.tuentiemail_value = this.controller.get("tuentiemail").mojo.value
    this.password_value = this.controller.get("password").mojo.getValue()
    //Only for debug, logout after login
    var request = new Ajax.Request("http://m.tuenti.com/?m=login&func=log_out");
    
    //Check if values are correct
    var request = new Ajax.Request("http://m.tuenti.com/?m=login&func=process_login", {
		method: 'post',
		parameters: {'tuentiemail': this.tuentiemail_value, 'password': this.password_value},
		evalJSON: false,
		onSuccess: this.ajaxRequestSuccess.bind(this),
		onFailure: function(transport) { Mojo.Log.error("Failure!"); }
	});
}

PreferencesAssistant.prototype.ajaxRequestSuccess = function(transport) {
    //Tuenti-tuenti en el titulo -> desconectado
    //Tuenti-* -> conectado
    
    //FIXME: I must check two times
    if (transport.responseText.match("<title>Tuenti-Tuenti")) {
        if (this.first_time == false) {
            Mojo.Controller.errorDialog("Usuario y/o contraseña incorrectos. Recuerda comprobar las mayúsculas y minúsculas.");
        } else {
            this.first_time = false;
            var request = new Ajax.Request("http://m.tuenti.com/?m=login&func=process_login", {
                method: 'post',
                parameters: {'tuentiemail': this.tuentiemail_value, 'password': this.password_value},
                evalJSON: false,
                onSuccess: this.ajaxRequestSuccess.bind(this),
                onFailure: function(transport) { Mojo.Log.error("Failure!"); }
            });
        }
    } else {
        this.cookied_tuentiemail.put(this.tuentiemail_value);
        this.cookied_password.put(this.password_value);
        
        this.controller.stageController.pushScene("tuenti");
    }
}