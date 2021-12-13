const CloudWatch = require('aws-sdk/clients/cloudwatch')
const cloudWatch = new CloudWatch({
	apiVersion: '2010-08-01',
	logger: console
})

/**
 * Constants
 */
const METRIC_NAMESPACE = process.env.METRIC_NAMESPACE
const CORE_DEVICE = process.env.CORE_DEVICE || false

/**
 * Lambda handler
 * 
 * @param {object[]} events
 * @param {string} events[].NS namespace
 * @param {string} events[].N name
 * @param {string} events[].U unit
 * @param {string} events[].A aggregation
 * @param {number} events[].V value
 * @param {number} events[].TS timestamp
 */
exports.handler = async function(events) {

	/** @type {CloudWatch.Dimensions} */
	const dimensions = []
	if (CORE_DEVICE) {
		dimensions.push({
			Name: 'CoreDevice',
			Value: CORE_DEVICE
		})
	}

	/** @type {CloudWatch.MetricData} */
	const metrics = [{
		MetricName: 'HealthCheck',
		Unit: 'Count',
		Value: 1,
		Dimensions: dimensions
	}]

	// Parse telemetry events into CloudWatch metric
	for (const event of events) {
		metrics.push({
			MetricName: event.N,
			Unit: event.U,
			Timestamp: event.TS / 1000,
			Dimensions: dimensions,
			Value: event.V
		})
	}

	// Put all CloudWatch metrics data at once in the same namespace
	await cloudWatch.putMetricData({
		Namespace: METRIC_NAMESPACE,
		MetricData: metrics
	}).promise()
}
