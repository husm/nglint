"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var tslint_1 = require("tslint");
var ngWalker_1 = require("codelyzer/angular/ngWalker");
var basicTemplateAstVisitor_1 = require("codelyzer/angular/templates/basicTemplateAstVisitor");
var MyDirectiveTemplateVistor = /** @class */ (function (_super) {
    __extends(MyDirectiveTemplateVistor, _super);
    function MyDirectiveTemplateVistor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.FAILURE_STRING = 'appChangeColor directive cannot be applied to the following tags: ng-container, ng-template and ng-content';
        return _this;
    }
    MyDirectiveTemplateVistor.prototype.visitElement = function (ast, context) {
        this.validateElement(ast, context);
        _super.prototype.visitElement.call(this, ast, context);
    };
    MyDirectiveTemplateVistor.prototype.visitEmbeddedTemplate = function (ast, context) {
        this.validateEmbeddedTemplate(ast, context);
        _super.prototype.visitEmbeddedTemplate.call(this, ast, context);
    };
    MyDirectiveTemplateVistor.prototype.visitNgContent = function (ast, context) {
        this.validateNgContent(ast, context);
        _super.prototype.visitNgContent.call(this, ast, context);
    };
    MyDirectiveTemplateVistor.prototype.hasMyDirectiveAttr = function (ast) {
        return (!!ast.attrs.length &&
            !!ast.attrs.filter(function (attr) { return attr.name === 'appChangeColor'; }).length);
    };
    MyDirectiveTemplateVistor.prototype.hasMyDirectiveInput = function (ast) {
        return (!!ast.inputs.length &&
            !!ast.inputs.filter(function (input) { return input.name === "appChangeColor"; }).length);
    };
    MyDirectiveTemplateVistor.prototype.addSourceValidationError = function (ast) {
        var _a = ast.sourceSpan, endOffset = _a.end.offset, startOffset = _a.start.offset;
        this.addFailureFromStartToEnd(startOffset, endOffset, this.FAILURE_STRING);
    };
    MyDirectiveTemplateVistor.prototype.astHasRegexMatch = function (ast, pattern) {
        if (!pattern.test(ast.sourceSpan.start.file.content)) {
            return false;
        }
        var onlyThisTag = ast.sourceSpan.start.file.content.slice(ast.sourceSpan.start.offset, ast.sourceSpan.end.offset);
        if (!pattern.test(onlyThisTag)) {
            return false;
        }
        return true;
    };
    MyDirectiveTemplateVistor.prototype.validateElement = function (ast, context) {
        if (ast.name === 'ng-container' && (this.hasMyDirectiveAttr(ast) || this.hasMyDirectiveInput(ast))) {
            this.addSourceValidationError(ast);
        }
    };
    MyDirectiveTemplateVistor.prototype.validateEmbeddedTemplate = function (ast, context) {
        var pattern = /<ng-template(?:[\s\S]*?)\[?appChangeColor\]?=["']([\w\d]+)["'](?:[\s\S]*?)>/;
        if (this.astHasRegexMatch(ast, pattern)) {
            this.addSourceValidationError(ast);
        }
    };
    MyDirectiveTemplateVistor.prototype.validateNgContent = function (ast, context) {
        var pattern = /<ng-content(?:[\s\S]*?)\[?appChangeColor\]?=["']([\w\d]+)["'](?:[\s\S]*?)>/;
        if (this.astHasRegexMatch(ast, pattern)) {
            this.addSourceValidationError(ast);
        }
    };
    return MyDirectiveTemplateVistor;
}(basicTemplateAstVisitor_1.BasicTemplateAstVisitor));
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ngWalker_1.NgWalker(sourceFile, this.getOptions(), { templateVisitorCtrl: MyDirectiveTemplateVistor }));
    };
    Rule.metadata = {
        ruleName: 'restrict-my-directive-on-tags',
        type: 'maintainability',
        description: "Ensures that 'myDirective' is not applied to unsupported tags",
        options: null,
        optionsDescription: 'Not configurable',
        rationale: "Applying 'myDirective' to unsupported tags will casue an error.",
        typescriptOnly: true
    };
    return Rule;
}(tslint_1.Rules.AbstractRule));
exports.Rule = Rule;
