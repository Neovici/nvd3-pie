/*global Cosmoz, Polymer, d3, document, nv*/
(function () {

	"use strict";

	Polymer({
		is: 'nvd3-pie',
		properties: {
			data: {
				type: Array,
				value: [],
				observer: '_dataChanged'
			},
			donut: {
				type: Boolean,
				value: false
			},
			multiSelection: {
				type: Boolean,
				value: false,
				observer: '_multiSelectionChanged'
			},
			selection: {
				type: Object,
				value: null,
				observer: '_selectionChanged',
				notify: true
			},
			showLabels: {
				type: Boolean,
				value: true
			},
			showLegend: {
				type: Boolean,
				value: false
			},
			extraWidth: {
				type: Number,
				value: 150
			},
			width: {
				type: Number,
				value: 300
			},
			height: {
				type: Number,
				value: 300
			},
			pieTitle: {
				type: String,
				value: 'title'
			},
			xProp: {
				type: String,
				value: 'label'
			},
			yProp: {
				type: String,
				value: 'value'
			},
			tooltips: {
				type: Boolean,
				value: true,
				reflectToAttribute: true
			},
			growOnHover: {
				type: Boolean,
				value: true
			},
			_tooltipId: {
				type: String,
				readOnly: true
			}
		},

		behaviors: [
			Cosmoz.ViewInfoBehavior
		],

		listeners: {
			'viewinfo-resize': 'refresh'
		},

		getViewBox: function (width, extraWidth, height) {
			return '0 0 ' + (width + extraWidth) + ' ' + height;
		},

		clearHighlight: function () {
			// TODO: This shouldn't be needed, figure out if selection !== highlighted slice
			var
				selectedSlice = this.$.svg.querySelector('.nv-pie .nv-slice.selected'),
				selectedLabel = this.$.svg.querySelector('.nv-pieLabels .nv-label.selected');

			if (selectedSlice) {
				selectedSlice.classList.remove('selected');
			}
			if (selectedLabel) {
				selectedLabel.classList.remove('selected');
			}
		},

		_multiSelectionChanged: function (newValue, oldValue) {
			this.selection = newValue
				? []
				: null;
		},

		_selectionChanged: function () {
			var
				slices = this.$.svg.querySelectorAll('.nv-pie .nv-slice'),
				labels = this.$.svg.querySelectorAll('.nv-pieLabels .nv-label');

			if (slices.length === 0) {
				return;
			}

			// console.log(slices, labels, this.data, this.selection);

			this.data.forEach(function (item, index) {

				var selected = this.multiSelection
					? this.selection.indexOf(item) > -1
					: this.selection === item;

				// console.log(selected);

				if (selected) {
					labels[index].classList.add('selected');
					slices[index].classList.add('selected');
				} else {
					labels[index].classList.remove('selected');
					slices[index].classList.remove('selected');
				}
			}.bind(this));
			this.fire('slice-selected', this.selection);
		},

		onElementClick: function (nvd3item) {
			var
				item = nvd3item.data,
				selected = this.multiSelection
					? this.selection.indexOf(item) > -1
					: this.selection === item;

			if (this.multiSelection) {
				if (selected) {
					this.selection.splice(this.selection.indexOf(item), 1);
				} else {
					this.selection.push(item);
				}
			} else {
				this.selection = item;
			}
		},
		ready: function () {
			nv.addGraph(function () {
				this.nvd3chart = nv.models.pieChart()
					.x(function (d) {
						return d[this.xProp];
					}.bind(this))
					.y(function (d) {
						return d[this.yProp];
					}.bind(this))
					.showLabels(this.showLabels)
					.showLegend(this.showLegend)
					.donut(this.donut)
					.labelsOutside(true)
					.growOnHover(this.growOnHover)
					.title(this.pieTitle)
					.width(this.width)
					.height(this.height);

				this.nvd3chart.tooltip.enabled(this.tooltips);

				this.nvd3chart.pie.dispatch.on("elementClick", this.onElementClick.bind(this));

				var startData = this.data === undefined ? [] : this.data;

				d3.select(this.$.svg)
					.attr("width", this.width + this.extraWidth)
					.attr("height", this.height)
					.datum(startData)
					.transition().duration(1200)
					.call(this.nvd3chart);

				this._set_tooltipId(this.nvd3chart.tooltip.id());
				return this.nvd3chart;
			}.bind(this));
		},

		detached: function () {
			var tooltip = document.getElementById(this._tooltipId);
			if (tooltip) {
				tooltip.remove();
			}
		},

		refresh: function () {
			/* Can be refreshed before nvd3 has finished creating the nvd3chart object */
			if (this.nvd3chart) {
				this.nvd3chart.update();
			}
		},

		_dataChanged: function () {
			if (this.nvd3chart) {
				d3.select(this.$.svg).datum(this.data);
				this.refresh();
			}
		}
	});
}());