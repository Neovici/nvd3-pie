/*global cz, document, Polymer, window, d3, nv */
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
				observer: '_selectionChanged'
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
				value: true
			},
			growOnHover: {
				type: Boolean,
				value: true
			}
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
				that = this,
				slices = this.$.svg.querySelectorAll('.nv-pie .nv-slice'),
				labels = this.$.svg.querySelectorAll('.nv-pieLabels .nv-label');

			if (slices.length === 0) {
				return;
			}

			console.log(slices, labels, this.data, this.selection);

			this.data.forEach(function (item, index) {

				var selected = that.multiSelection
					? that.selection.indexOf(item) > -1
					: that.selection === item;

				console.log(selected);

				if (selected) {
					labels[index].classList.add('selected');
					slices[index].classList.add('selected');
				} else {
					labels[index].classList.remove('selected');
					slices[index].classList.remove('selected');
				}
			});
			this.fire('cz-chartselection', this.selection);
		},

		onElementClick: function (nvd3item) {
			console.log(nvd3item);
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
		attached: function () {
			this.async(function () {
				var that = this;
				nv.addGraph(function () {
					that.nvd3chart = nv.models.pieChart()
						.x(function (d) {
							return d[that.xProp];
						})
						.y(function (d) {
							return d[that.yProp];
						})
						.showLabels(that.showLabels)
						.showLegend(that.showLegend)
						.donut(that.donut)
						.labelsOutside(true)
						.growOnHover(that.growOnHover)
						.title(that.pieTitle)
						.width(that.width)
						.height(that.height);

					that.nvd3chart.tooltip.enabled(that.tooltips);

					that.nvd3chart.pie.dispatch.on("elementClick", that.onElementClick.bind(that));

					d3.select(that.$.svg)
						.attr("width", that.width + that.extraWidth)
						.attr("height", that.height)
						.datum(that.data)
						.transition().duration(1200)
						.call(that.nvd3chart);

					return that.nvd3chart;
				});
			});
		},

		refresh: function () {
			this.nvd3chart.update();
		},

		_dataChanged: function () {
			if (this.nvd3chart) {
				d3.select(this.$.svg).datum(this.data);
				this.refresh();
			}
		}
	});
}());