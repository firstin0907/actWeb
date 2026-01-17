# ActWeb - The Affection Control Theory Web Visualizer

ActWeb is a web-based visualization tool designed to explore and analyze EPA (Evaluation, Potency, Activity) profiles across various cultural datasets. This project is inspired by Affect Control Theory (ACT), a social psychology framework that examines how people interpret and adjust their emotions and behaviors based on cultural norms and expectations.

## Features

- **Cultural Dataset Selection**: Choose from a variety of cultural datasets (e.g., China 1999, Egypt 2015, Germany 2007) to explore EPA profiles.
- **Interactive Word List**: Filter and select words to visualize their EPA scores.
- **Dynamic Plotting**: Visualize EPA dimensions (E-P, E-A, P-A) interactively using Plotly.
- **Selected Words Panel**: Keep track of selected words and their corresponding EPA profiles.

## How to Use

1. **Select a Culture**: Use the dropdown menu on the left to select a cultural dataset.
2. **Search for Words**: Use the search box to filter words from the dataset.
3. **Visualize EPA Scores**: Click on words to plot their EPA profiles on the graph.
4. **Manage Selected Words**: View and clear selected words in the right panel.

## Data Sources

The EPA profiles are derived from survey data collected across various cultures. The datasets include terms evaluated on three dimensions:

- **Evaluation (E)**: Positive (+) to Negative (-)
- **Potency (P)**: Strong (+) to Weak (-)
- **Activity (A)**: Active (+) to Passive (-)

For more details, visit the [ActData GitHub repository](https://ahcombs.github.io/actdata) by [Aidan Combs](https://orcid.org/0000-0003-1955-3572).

## Libraries and Frameworks

- **Bootstrap**: For responsive design and layout.
- **Plotly.js**: For interactive plotting.
- **D3.js**: For data manipulation and visualization.

## File Structure

```
actWeb/
├── index.html       # Main HTML file
├── index.css        # Stylesheet
├── index.js         # JavaScript logic
├── change.py        # Python script (purpose unspecified)
├── LICENSE          # License file
├── data/            # Folder containing cultural datasets in CSV format
├── image/           # Folder for images (e.g., contact.png)
```

## Notes and Limitations

- The EPA mean values are averages of male and female survey responses within each culture sample. These values are not weighted by actual population distributions.
- While the datasets aim to represent cultural norms, individual variations and biases may exist.

## Author

This project, ActWeb, is authored by [Sin Gisub](https://github.com/firstin0907).

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file.
