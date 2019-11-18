import { Rules, IRuleMetadata, RuleFailure } from 'tslint';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker } from 'codelyzer/angular/ngWalker';
import { BasicTemplateAstVisitor } from 'codelyzer/angular/templates/basicTemplateAstVisitor';
import { ElementAst, EmbeddedTemplateAst, NgContentAst, AttrAst, BoundElementPropertyAst, TemplateAst } from '@angular/compiler';


class MyDirectiveTemplateVistor extends BasicTemplateAstVisitor {
  readonly FAILURE_STRING = 'appChangeColor directive cannot be applied to the following tags: ng-container, ng-template and ng-content';

  visitElement(ast: ElementAst, context: BasicTemplateAstVisitor): any {
    this.validateElement(ast, context);
    super.visitElement(ast, context);
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: BasicTemplateAstVisitor): any {
    this.validateEmbeddedTemplate(ast, context);
    super.visitEmbeddedTemplate(ast, context);
  }

  visitNgContent(ast: NgContentAst, context: BasicTemplateAstVisitor): any {
    this.validateNgContent(ast, context);
    super.visitNgContent(ast, context);
  }

  private hasMyDirectiveAttr(ast: ElementAst): boolean {
    return (
      !!ast.attrs.length &&
      !!ast.attrs.filter((attr: AttrAst) => attr.name === 'appChangeColor').length
    );
  }

  private hasMyDirectiveInput(ast: ElementAst): boolean {
    return (
      !!ast.inputs.length &&
      !!ast.inputs.filter((input: BoundElementPropertyAst) => input.name === `appChangeColor`).length
    );
  }

  private addSourceValidationError(ast: TemplateAst) {
    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset }
      }
    } = ast;

    this.addFailureFromStartToEnd(startOffset, endOffset, this.FAILURE_STRING);
  }

  private astHasRegexMatch(ast: TemplateAst, pattern: RegExp): boolean {
    if (!pattern.test(ast.sourceSpan.start.file.content)) {
      return false;
    }

    const onlyThisTag = ast.sourceSpan.start.file.content.slice(
      ast.sourceSpan.start.offset,
      ast.sourceSpan.end.offset
    );

    if (!pattern.test(onlyThisTag)) {
      return false;
    }

    return true;
  }

  private validateElement(ast: ElementAst, context: BasicTemplateAstVisitor): any {
    if (ast.name === 'ng-container' && (this.hasMyDirectiveAttr(ast) || this.hasMyDirectiveInput(ast))) {
      this.addSourceValidationError(ast);
    }
  }

  private validateEmbeddedTemplate(ast: EmbeddedTemplateAst, context: BasicTemplateAstVisitor): any {
    const pattern = /<ng-template(?:[\s\S]*?)\[?appChangeColor\]?=["']([\w\d]+)["'](?:[\s\S]*?)>/;
    if (this.astHasRegexMatch(ast, pattern)) {
      this.addSourceValidationError(ast);
    }
  }

  private validateNgContent(ast: NgContentAst, context: BasicTemplateAstVisitor): any {
    const pattern = /<ng-content(?:[\s\S]*?)\[?appChangeColor\]?=["']([\w\d]+)["'](?:[\s\S]*?)>/;
    if (this.astHasRegexMatch(ast, pattern)) {
      this.addSourceValidationError(ast);
    }
  }
}

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    ruleName: 'restrict-my-directive-on-tags',
    type: 'maintainability',
    description: `Ensures that 'myDirective' is not applied to unsupported tags`,
    options: null,
    optionsDescription: 'Not configurable',
    rationale: `Applying 'myDirective' to unsupported tags will casue an error.`,
    typescriptOnly: true
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new NgWalker(sourceFile, this.getOptions(),
    { templateVisitorCtrl: MyDirectiveTemplateVistor }
    ));
  }
}


