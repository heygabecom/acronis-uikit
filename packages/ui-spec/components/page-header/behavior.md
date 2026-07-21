# PageHeader — behavior

```gherkin
Scenario: Title + actions
  Given a PageHeader with a PageHeaderRow of a title and actions
  Then the title sits at the left and the actions at the right edge
```

```gherkin
Scenario: Tags share the row with actions
  Given a PageHeaderRow with a title, a PageHeaderTags slot, and a PageHeaderActions slot
  Then tags sit next to the title and actions stay flush right, even when tags are empty
```

```gherkin
Scenario: Description under the title
  Given a PageHeaderDescriptionRow below the title row
  Then the muted description renders capped at 512px width
```

```gherkin
Scenario: Editable title or description
  Given a page that lets the user rename its title or description inline (e.g. a
  full-page wizard like Create Dashboard)
  Then render a ButtonIcon with the pencil icon as a sibling next to the title or
  the description — PageHeader has no dedicated part for it, since it's the same
  atom either row
```

```gherkin
Scenario: Breadcrumb above PageHeader
  Given a page that also shows a breadcrumb trail
  Then render a Breadcrumb as a separate sibling above PageHeader, not nested inside it
```

```gherkin
Scenario: Tags overflow
  Given a PageHeaderTags slot with more than one tag
  And the full set of tags doesn't fit the width available to the slot
  Then show only the first tag and fold the rest under a single "+#" tag
  And hovering or focusing the "+#" tag shows a tooltip listing the hidden tags' labels
```

```gherkin
Scenario: Tags fit
  Given a PageHeaderTags slot
  When the full set of tags fits the width available to the slot
  Then render every tag directly, with no overflow tag
```

```gherkin
Scenario: Actions overflow
  Given a PageHeaderActions slot with at least one secondary-variant Button action
  And the full set of actions doesn't fit the width available to the slot
  Then fold every secondary-variant Button action under a single "More" ButtonIcon that opens a dropdown menu of them, in their original order
  And leave every primary-variant action visible — it is never folded into the menu
  And leave any non-Button action (e.g. a ButtonMenu trigger) visible and unfolded, even with variant="secondary" — folding only covers a plain button with a single click action
```

```gherkin
Scenario: Actions fit
  Given a PageHeaderActions slot
  When the full set of actions fits the width available to the slot
  Then render every action directly, with no "More" ButtonIcon
```
