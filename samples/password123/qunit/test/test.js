module("Environment");

test("Globals", function() {
	expect(3);
	equals( QUnit.equiv(jQuery, undefined), false, "jQuery present" );
	equals( QUnit.equiv(jQuery.fn.password123, undefined), false, "password123 present" );
	equals( QUnit.equiv(jQuery.event.special.textchange, undefined), false, "textchange event present" );
});

module("General");
var $field
test("Check Field Replacement", function() {
	expect(16);
	$field = $('#password1, #password2').password123();
	equals( $field.length, 2, "New Fields Created" );
	ok( $field.is(':text'), "Password inputs replaced" );
	ok( /iField/gi.test( $field.attr("id") ), "New ID attached" );
	equals( $field.val(), "placeholder", "Placeholder added" );
	equals( $field.data("password123").$hidden.val(), '', "Placeholder not kept in value" );
	
	equals( $field.eq(1).val(), "value", "Value given priority over placeholder, maskInitial set to false" );
	ok( $field.hasClass('place'), "Placeholder class working" );
	equals( $field.eq(1).data("password123").$hidden.val(), "value", "Hidden field value respects value attribute" );
	
	$field = $('#text1').password123();
	ok( $field.is(':text'), "Text input skipped properly" );
	$('#text1').remove();
	
	equals( $('#form').serialize(), "password1=&password2=value", "Placeholder not sent with form" );
	$field = $('.password_disabled').password123();
	equals( $('#form').serialize(), "password1=&password2=value", "Disabled field still disabled" );
	
	$field = $('#password_attrs').password123();
	equals( $field[0].className, "testing a bunch of classes", "Classes kept" );
	equals( $field.attr('size'), 12, "size" );
	equals( $field.attr('maxlength'), 30, "maxlength" );
	equals( $field.attr('readonly'), true, "readonly" );
	equals( $field.attr('tabindex'), "1", "tabindex" );
});

test("Options", function() {
	expect(4);
	var $field = $('#password3').password123({
		delay: 1000,
		prefix: "iTest",
		placeholder: false
	});
	
	equals( $field.password123("option", "delay"), 1000, "Initial delay set");
	ok( /iTest/.test( $field.attr('id') ), "Different ID prefix used" );
	equals( $field.val(), "", "Placeholder turned off" );
	
	$field = $('#password_mask').password123({
		character: "t",
		maskInitial: true
	});
	equals( $field.val(), "tttk", "Value masked; character change to 't'" );
});

module("Methods");
test("Destroy", function() {
	expect(5);
	var $field = $('#password_destroy').password123();
	ok( $field.is(':text'), "Plugin instantiated" );
	$field = $field.password123("destroy");
	ok( $field.is(':password'), "password123 successfully destroyed" );
	equals( $field.val(), "old value", "Old value still in place" );
	var typeone = $field.is(':password');
	$field.password123("destroy");
	var typetwo = $field.is(':password');
	equals( typeone, typetwo, "destroy safely moves along for non-password123 fields" );
	$field = $field.password123();
	typeone = $field.is(':password');
	equals( typeone, false, "Reinstantiate after destroy successfully" );
});

test("Option", function() {
	expect(7);
	var $field = $('#password_option').password123();
	equals( $field.password123("option", "delay"), 2000, "Delay option getter" );
	$field.password123("option", "delay", 3000);
	equals( $field.password123("option", "delay"), 3000, "Delay option setter" );
	$field.password123( "option", { delay: 2000, placeholder: false, prefix: "ding"} );
	equals( $field.password123("option", "delay"), 2000, "Delay option setter" );
	equals( $field.val(), "", "Placeholder option changed" );
	ok( $('[id^=ding]').length, "Prefix added" );
	equals( $field.password123("option", "prefix"), "ding", "Prefix option getter" );
	equals( $field.password123("option").maskInitial, false, "No args option call" );
});
